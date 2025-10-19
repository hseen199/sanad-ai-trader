
    import {
    	Toast,
    	ToastClose,
    	ToastDescription,
    	ToastProvider,
    	ToastTitle,
    	ToastViewport,
    } from '@/components/ui/toast';
    import { useToast } from '@/components/ui/use-toast';
    import React from 'react';
    
    export function Toaster() {
    	const { toasts } = useToast();
    
    	return (
    		<ToastProvider>
    			{toasts.map(({ id, title, description, action, icon, ...props }) => {
    				return (
    					<Toast key={id} {...props}>
                <div className="flex items-start gap-4">
                  {icon && <div className="flex-shrink-0 mt-1">{icon}</div>}
    						  <div className="grid gap-1">
    							  {title && <ToastTitle>{title}</ToastTitle>}
    							  {description && (
    								  <ToastDescription>{description}</ToastDescription>
    							  )}
    						  </div>
                </div>
    						{action}
    						<ToastClose />
    					</Toast>
    				);
    			})}
    			<ToastViewport />
    		</ToastProvider>
    	);
    }
  