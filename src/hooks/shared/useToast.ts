type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastOptions {
  title: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    const { title, description, variant = 'default', duration = 3000 } = options;
    
    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.className = `fixed bottom-4 right-4 p-4 rounded-md shadow-lg max-w-md z-50 transform transition-all duration-300 ease-in-out translate-y-0 opacity-100`;
    
    // Set background color based on variant
    if (variant === 'destructive') {
      toastEl.classList.add('bg-red-500', 'text-white');
    } else if (variant === 'success') {
      toastEl.classList.add('bg-green-500', 'text-white');
    } else {
      toastEl.classList.add('bg-white', 'dark:bg-gray-800', 'text-black', 'dark:text-white', 'border', 'border-gray-200', 'dark:border-gray-700');
    }
    
    // Create content
    toastEl.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-medium">${title}</h3>
          <p class="mt-1 text-sm opacity-90">${description}</p>
        </div>
        <button class="ml-4 text-sm opacity-70 hover:opacity-100">×</button>
      </div>
    `;
    
    // Add to DOM
    document.body.appendChild(toastEl);
    
    // Add close button functionality
    const closeButton = toastEl.querySelector('button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        removeToast();
      });
    }
    
    // Auto remove after duration
    const timeoutId = setTimeout(removeToast, duration);
    
    // Remove function
    function removeToast() {
      toastEl.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => {
        if (document.body.contains(toastEl)) {
          document.body.removeChild(toastEl);
        }
      }, 300);
      clearTimeout(timeoutId);
    }
  };
  
  return toast;
}