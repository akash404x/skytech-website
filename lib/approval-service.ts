import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ApprovalAction, ApprovalType, ApprovalStatus } from '@/lib/types';

export interface ApprovalRequestData {
  type: ApprovalType;
  action: ApprovalAction;
  documentId: string | null;
  newData: Record<string, unknown>;
  oldData: Record<string, unknown>;
  requestedBy: {
    uid: string;
    name: string;
    email: string;
  };
}

export async function createApprovalRequest(data: ApprovalRequestData) {
  try {
    const approvalRef = await addDoc(collection(db, 'approval_requests'), {
      ...data,
      status: 'pending' as ApprovalStatus,
      createdAt: serverTimestamp(),
      approvedBy: null,
      approvedAt: null,
      rejectedReason: null,
    });
    return { success: true, id: approvalRef.id };
  } catch (error) {
    console.error('Error creating approval request:', error);
    return { success: false, error: 'Failed to create approval request' };
  }
}

export async function approveRequest(requestId: string, adminUid: string, adminName: string) {
  try {
    const requestRef = doc(db, 'approval_requests', requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      return { success: false, error: 'Request not found' };
    }

    const requestData = requestDoc.data();
    
    // Execute the approved action
    const result = await executeApprovedAction(requestData);
    
    if (!result.success) {
      return result;
    }

    // Update the request status
    await updateDoc(requestRef, {
      status: 'approved',
      approvedBy: adminUid,
      approvedAt: serverTimestamp(),
    });

    // Create activity log
    await createActivityLog(adminName, `Approved ${requestData.action} ${requestData.type}`, getTargetName(requestData));

    // Create notification for the editor
    await createEditorNotification(requestData.requestedBy, requestData.type, requestData.action, true);

    return { success: true };
  } catch (error) {
    console.error('Error approving request:', error);
    return { success: false, error: 'Failed to approve request' };
  }
}

export async function rejectRequest(requestId: string, adminUid: string, adminName: string, reason: string) {
  try {
    const requestRef = doc(db, 'approval_requests', requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      return { success: false, error: 'Request not found' };
    }

    const requestData = requestDoc.data();

    // Update the request status
    await updateDoc(requestRef, {
      status: 'rejected',
      approvedBy: adminUid,
      approvedAt: serverTimestamp(),
      rejectedReason: reason,
    });

    // Create activity log
    await createActivityLog(adminName, `Rejected ${requestData.action} ${requestData.type}`, getTargetName(requestData));

    // Create notification for the editor
    await createEditorNotification(requestData.requestedBy, requestData.type, requestData.action, false, reason);

    return { success: true };
  } catch (error) {
    console.error('Error rejecting request:', error);
    return { success: false, error: 'Failed to reject request' };
  }
}

async function executeApprovedAction(requestData: any) {
  const { type, action, documentId, newData, oldData } = requestData;

  try {
    if (type === 'product') {
      return await executeProductAction(action, documentId, newData, oldData);
    } else if (type === 'service') {
      return await executeServiceAction(action, documentId, newData, oldData);
    } else if (type === 'work') {
      return await executeWorkAction(action, documentId, newData, oldData);
    }
    return { success: false, error: 'Unknown type' };
  } catch (error) {
    console.error('Error executing approved action:', error);
    return { success: false, error: 'Failed to execute action' };
  }
}

async function executeProductAction(action: ApprovalAction, documentId: string | null, newData: Record<string, unknown>, oldData: Record<string, unknown>) {
  const { addDoc, collection, deleteDoc, doc, updateDoc } = await import('firebase/firestore');

  if (action === 'create') {
    await addDoc(collection(db, 'products'), {
      ...newData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else if (action === 'update') {
    await updateDoc(doc(db, 'products', documentId!), {
      ...newData,
      updatedAt: serverTimestamp(),
    });
  } else if (action === 'delete') {
    await deleteDoc(doc(db, 'products', documentId!));
  }

  return { success: true };
}

async function executeServiceAction(action: ApprovalAction, documentId: string | null, newData: Record<string, unknown>, oldData: Record<string, unknown>) {
  const { addDoc, collection, deleteDoc, doc, updateDoc } = await import('firebase/firestore');

  if (action === 'create') {
    await addDoc(collection(db, 'services'), {
      ...newData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else if (action === 'update') {
    await updateDoc(doc(db, 'services', documentId!), {
      ...newData,
      updatedAt: serverTimestamp(),
    });
  } else if (action === 'delete') {
    await deleteDoc(doc(db, 'services', documentId!));
  }

  return { success: true };
}

async function executeWorkAction(action: ApprovalAction, documentId: string | null, newData: Record<string, unknown>, oldData: Record<string, unknown>) {
  const { addDoc, collection, deleteDoc, doc, updateDoc } = await import('firebase/firestore');

  if (action === 'create') {
    await addDoc(collection(db, 'works'), {
      ...newData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else if (action === 'update') {
    await updateDoc(doc(db, 'works', documentId!), {
      ...newData,
      updatedAt: serverTimestamp(),
    });
  } else if (action === 'delete') {
    await deleteDoc(doc(db, 'works', documentId!));
  }

  return { success: true };
}

async function createActivityLog(user: string, action: string, target: string) {
  try {
    await addDoc(collection(db, 'activity_logs'), {
      user,
      action,
      target,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
  }
}

async function createEditorNotification(
  requestedBy: { uid: string; name: string; email: string },
  type: ApprovalType,
  action: ApprovalAction,
  approved: boolean,
  reason?: string
) {
  try {
    const { addDoc, collection } = await import('firebase/firestore');
    
    const message = approved 
      ? `Your ${type} ${action} request has been approved.`
      : `Your ${type} ${action} request was rejected. ${reason ? `Reason: ${reason}` : ''}`;

    await addDoc(collection(db, 'notifications'), {
      userId: requestedBy.uid,
      userEmail: requestedBy.email,
      title: approved ? 'Request Approved' : 'Request Rejected',
      message,
      type: approved ? 'approval_approved' : 'approval_rejected',
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating editor notification:', error);
  }
}

function getTargetName(requestData: any): string {
  if (requestData.type === 'product') {
    return (requestData.newData.name as string) || 'Product';
  } else if (requestData.type === 'service') {
    return (requestData.newData.title as string) || 'Service';
  } else if (requestData.type === 'work') {
    return (requestData.newData.title as string) || 'Work';
  }
  return 'Unknown';
}
