
import React, { useState } from 'react';
import { ShieldCheck, Clipboard, ClipboardCheck, AlertTriangle } from 'lucide-react';

const AdminCreationSuccessModal = ({ credentials, onClose }) => {
    const [copyText, setCopyText] = useState('Copy');

    const handleCopy = () => {
        // Create the text string to be copied
        const textToCopy = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
        
        // Use the Clipboard API to copy the text
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopyText('Copied!');
            // Reset the button text after 2 seconds
            setTimeout(() => setCopyText('Copy'), 2000);
        }).catch(err => {
            console.error('Failed to copy credentials: ', err);
            setCopyText('Failed to copy');
            setTimeout(() => setCopyText('Copy'), 2000);
        });
    };

    return (
        // The `modal-open` class makes it visible
        <div className="modal modal-open">
            <div className="modal-box">
                <div className="text-center">
                    <ShieldCheck className="w-16 h-16 text-success mx-auto mb-4" />
                    <h3 className="font-bold text-2xl">Admin Registered!</h3>
                </div>

                {}
                <div className="my-6 p-4 bg-base-200 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-base-content/70">Email:</span>
                        <span className="font-mono font-semibold">{credentials.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-base-content/70">Password:</span>
                        <span className="font-mono font-semibold">{credentials.password}</span>
                    </div>
                </div>

                {}
                <div role="alert" className="alert alert-info">
                    <AlertTriangle className="text-info-content" />
                    <div>
                        <h3 className="font-bold">Share these credentials with the new admin.</h3>
                        <div className="text-xs">It is recommended they change their password on first login.</div>
                    </div>
                </div>
                
                <div className="modal-action items-center justify-between mt-6">
                    <button onClick={handleCopy} className="btn btn-ghost gap-2">
                        {copyText === 'Copy' ? <Clipboard size={16}/> : <ClipboardCheck size={16} className="text-success"/>}
                        {copyText}
                    </button>
                    <button onClick={onClose} className="btn btn-primary">Done</button>
                </div>
            </div>
        </div>
    );
};

export default AdminCreationSuccessModal;