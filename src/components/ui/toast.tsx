import * as React from "react";

export const Toast = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const ToastClose = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const ToastDescription = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const ToastProvider = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const ToastTitle = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const ToastViewport = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const ToastAction = ({ children, ...props }: any) => <div {...props}>{children}</div>;

export type ToastActionElement = React.ReactElement<any>;
export type ToastProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: 'default' | 'destructive';
};
