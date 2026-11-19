/**
 * WhatsApp Sharing Utilities
 * Handles sharing order details with payment slip via WhatsApp
 * Supports Web Share API with graceful fallback
 */

export interface WhatsAppShareOptions {
  number: string;
  message: string;
  file?: File | null;
  onSharing?: () => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface ShareResult {
  success: boolean;
  method: 'native' | 'fallback' | 'error';
  message?: string;
  error?: Error;
}

/**
 * Convert WhatsApp number to wa.me URL format
 * Removes all non-digits and constructs the URL with text parameter
 */
function getWhatsAppWebUrl(number: string, text: string): string {
  const cleanNumber = number.replace(/\D/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Share order details with payment slip via Web Share API
 * Attempts native file sharing first, falls back to WhatsApp Web with text
 */
export async function shareOrderOnWhatsApp(options: WhatsAppShareOptions): Promise<ShareResult> {
  const { number, message, file, onSharing, onSuccess, onError } = options;

  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    const error = new Error('Web Share API not available in this environment');
    onError?.(error);
    return {
      success: false,
      method: 'error',
      error,
    };
  }

  try {
    // Notify that sharing is starting
    onSharing?.();

    // Attempt 1: Use native Web Share API if available and file is provided
    if (file && navigator.share && navigator.canShare) {
      try {
        const shareData = {
          title: 'Snails by Senara - Order Confirmation',
          text: message,
          files: [file],
        };

        // Check if the browser can share with files
        if (navigator.canShare(shareData)) {
          console.log('Using native Web Share API for file sharing');
          await navigator.share(shareData);

          onSuccess?.();
          return {
            success: true,
            method: 'native',
            message: 'Native share flow completed. Confirm WhatsApp as the recipient and send the message.',
          };
        }
      } catch (nativeErr) {
        // Check if error is due to user cancellation (not a real error)
        if (nativeErr instanceof Error) {
          if (nativeErr.name === 'AbortError') {
            console.log('User cancelled native share');
            return {
              success: false,
              method: 'error',
              error: new Error('Share cancelled by user'),
            };
          }
          console.warn('Native share failed, falling back to WhatsApp Web:', nativeErr.message);
        }
      }
    }

    // Attempt 2: Fallback to opening WhatsApp Web with pre-filled message
    // User will need to manually attach the file
    console.log('Opening WhatsApp Web with pre-filled message');
    const whatsappUrl = getWhatsAppWebUrl(number, message);

    // Open in a new window
    const whatsappWindow = window.open(whatsappUrl, '_blank');

    if (!whatsappWindow) {
      const error = new Error('Failed to open WhatsApp. Popup blocker may be enabled.');
      onError?.(error);
      return {
        success: false,
        method: 'error',
        error,
      };
    }
    whatsappWindow.opener = null;

    // Note: We cannot reliably detect if the user sent the message
    // But we consider the fallback successful if WhatsApp opened
    onSuccess?.();
    return {
      success: true,
      method: 'fallback',
      message: 'WhatsApp opened with order details. Please manually attach your payment slip.',
    };

  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Error sharing order on WhatsApp:', error);
    onError?.(error);
    return {
      success: false,
      method: 'error',
      error,
    };
  }
}

/**
 * Generate a formatted WhatsApp message for order confirmation
 */
export function formatOrderMessage(params: {
  orderNumber: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  specialNotes?: string;
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    totalPrice: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
}): string {
  const lines: string[] = [
    '🛍️ *ORDER CONFIRMATION*',
    '',
    `Order #: *${params.orderNumber}*`,
    `Customer Name: ${params.customerName}`,
    `Phone: ${params.phone}`,
    `Delivery Address: ${params.deliveryAddress}`,
  ];

  if (params.specialNotes) {
    lines.push(`Special Notes: ${params.specialNotes}`);
  }

  lines.push(
    '',
    '*📦 ORDER ITEMS:*',
    ...params.items.map(
      (item) => `• ${item.name} (${item.size}) x${item.quantity} = Rs. ${item.totalPrice.toLocaleString('en-LK')}`
    ),
    '',
    '*💰 PAYMENT SUMMARY:*',
    `Subtotal: Rs. ${params.subtotal.toLocaleString('en-LK')}`,
    `Delivery Fee: Rs. ${params.deliveryFee.toLocaleString('en-LK')}`,
    `*Total Amount: Rs. ${params.total.toLocaleString('en-LK')}*`,
    '',
    '*🏦 BANK TRANSFER DETAILS:*',
    `Bank: ${params.bankName}`,
    `Account Name: ${params.accountName}`,
    `Account Number: ${params.accountNumber}`,
    `Branch: ${params.branch}`,
    '',
    '⚠️ *Please attach your payment slip as an image to this message.*',
    '',
    'Thank you for your order! 🙏'
  );

  return lines.join('\n');
}

/**
 * Get a user-friendly error message based on the share result
 */
export function getErrorMessage(result: ShareResult): string {
  if (result.method === 'error') {
    if (result.error?.message.includes('AbortError') || result.error?.message.includes('cancelled by user')) {
      return 'Sharing was cancelled. Your order remains here, and you can try again.';
    }
    if (result.error?.message.includes('popup')) {
      return 'Could not open WhatsApp. Please check your popup blocker settings.';
    }
    return result.error?.message || 'Failed to share on WhatsApp.';
  }
  return 'An unexpected error occurred.';
}

/**
 * Get a user-friendly success message based on the share method
 */
export function getSuccessMessage(result: ShareResult, orderNumber: string): string {
  if (result.method === 'native') {
    return `Order #${orderNumber} ready in the share sheet. Choose WhatsApp, confirm the business chat, and tap Send.`;
  }
  if (result.method === 'fallback') {
    return `Order #${orderNumber} opened in WhatsApp. Please attach your payment slip image and send.`;
  }
  return `Order #${orderNumber} ready to share.`;
}
