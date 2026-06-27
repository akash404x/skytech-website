export interface EmailVariables {
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  coupon?: string;
  website?: string;
  unsubscribe?: string;
}

export function replaceVariables(
  content: string,
  variables: EmailVariables
): string {
  let result = content;

  if (variables.name) {
    result = result.replace(/\{\{name\}\}/gi, variables.name);
  }
  if (variables.email) {
    result = result.replace(/\{\{email\}\}/gi, variables.email);
  }
  if (variables.phone) {
    result = result.replace(/\{\{phone\}\}/gi, variables.phone);
  }
  if (variables.date) {
    result = result.replace(/\{\{date\}\}/gi, variables.date);
  }
  if (variables.coupon) {
    result = result.replace(/\{\{coupon\}\}/gi, variables.coupon);
  }
  if (variables.website) {
    result = result.replace(/\{\{website\}\}/gi, variables.website);
  }
  if (variables.unsubscribe) {
    result = result.replace(/\{\{unsubscribe\}\}/gi, variables.unsubscribe);
  }

  return result;
}

export function extractVariables(content: string): string[] {
  const variablePattern = /\{\{(\w+)\}\}/g;
  const variables = new Set<string>();
  let match;

  while ((match = variablePattern.exec(content)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}
