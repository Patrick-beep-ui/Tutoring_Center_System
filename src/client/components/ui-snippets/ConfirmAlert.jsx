import React, { memo, useCallback } from "react";
import { createPortal } from "react-dom";

const ConfirmAlert = ({ 
    message = "Are you sure?", 
    onConfirm, 
    onCancel, 
    visible 
}) => {
    const handleConfirm = useCallback(() => {
        onConfirm && onConfirm();
    }, [onConfirm]);

    const handleCancel = useCallback(() => {
        onCancel && onCancel();
    }, [onCancel]);

    if (!visible) return null;

    return createPortal(
        <div style={styles.overlay}>
            <div style={styles.alertBox}>
                <p style={styles.message}>{message}</p>
                <div style={styles.buttons}>
                    <button style={{ ...styles.button, ...styles.cancel }} onClick={handleCancel}>
                        Cancel
                    </button>
                    <button style={{ ...styles.button, ...styles.confirm }} onClick={handleConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>,
        document.body 
    );
};

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: '0px',
        margin: '0px'
    },
    alertBox: {
        backgroundColor: "#fff",
        padding: "20px 30px",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        maxWidth: "400px",
        width: "90%"
    },
    message: {
        fontSize: "16px",
        marginBottom: "20px"
    },
    buttons: {
        display: "flex",
        justifyContent: "space-around"
    },
    button: {
        padding: "10px 20px",
        border: "none",
        borderRadius: "6px",
        fontSize: "14px",
        cursor: "pointer",
        fontWeight: "bold"
    },
    cancel: {
        backgroundColor: "#ccc",
        color: "#000"
    },
    confirm: {
        backgroundColor: "#DC143C",
        color: "#fff"
    }
};

export default memo(ConfirmAlert);
