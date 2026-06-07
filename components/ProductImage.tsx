import Image from 'next/image';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

export default function ProductImage({ src, alt, priority = false, className = '' }: ProductImageProps) {
  if (!src) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
        <Package className="h-12 w-12" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
      className={`object-contain ${className}`}
      unoptimized={true}
    />
  );
}
