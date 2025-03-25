import { useEffect, useState, useCallback, useRef } from 'react';
import { messaging, generateToken } from '../../firebaseConfig';

// Configuration constants
const API_ENDPOINT = 'https://southamerica-east1-zops-mobile.cloudfunctions.net/saveToken';
const COLLECTION_NAME = 'users';
const STORAGE_KEY = 'fcm_notification_setup';
const NOTIFICATION_TIMEOUT = 5000;

const NotificationSetup = () => {
    // Enhanced state to handle platform-specific scenarios
    const [notificationState, setNotificationState] = useState({
        loading: false,
        showInstallInstructions: false,
        error: null,
        success: false,
        visible: false,
        debugInfo: null,
        userAction: false // Flag to indicate if user has triggered a permission request action
    });
    
    // Track browser environment
    const [browserInfo, setBrowserInfo] = useState({
        isSafari: false,
        isIOS: false,
        isMacOS: false,
        isInStandaloneMode: false,
        requiresUserAction: false
    });

    const notificationTimerRef = useRef(null);
    const setupAttemptedRef = useRef(false);
    const debugInfoRef = useRef([]);
    
    // Detect browser and platform on component mount
    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isMacOS = /macintosh/.test(userAgent) && !isIOS;
        const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
        const isInStandaloneMode = 'standalone' in window.navigator && window.navigator.standalone;
        
        // Safari on iOS or macOS requires user action for push permission requests
        const requiresUserAction = (isIOS || isMacOS) && isSafari;
        
        setBrowserInfo({
            isSafari,
            isIOS,
            isMacOS,
            isInStandaloneMode,
            requiresUserAction
        });
        
        // Show installation instructions for iOS
        if (isIOS && !isInStandaloneMode) {
            setNotificationState(prev => ({
                ...prev,
                showInstallInstructions: true,
                visible: true
            }));
        }
        
        addDebugInfo(`Browser detection: iOS=${isIOS}, macOS=${isMacOS}, Safari=${isSafari}, Standalone=${isInStandaloneMode}, RequiresUserAction=${requiresUserAction}`);
    }, []);

    // Function to close notifications
    const hideNotification = useCallback(() => {
        setNotificationState(prev => ({
            ...prev,
            visible: false
        }));
    }, []);

    // Function to manually close notifications
    const handleCloseNotification = () => {
        if (notificationTimerRef.current) {
            clearTimeout(notificationTimerRef.current);
        }
        hideNotification();
    };

    // Utility function to add debug info
    const addDebugInfo = useCallback((message) => {
        const timestamp = new Date().toISOString();
        debugInfoRef.current = [
            ...debugInfoRef.current,
            `${timestamp}: ${message}`
        ].slice(-10); // Keep last 10 messages
        
        setNotificationState(prev => ({
            ...prev,
            debugInfo: debugInfoRef.current.join('\n')
        }));
        
        console.log(`[DEBUG] ${message}`);
    }, []);

    // Helper to check if setup was already completed
    const isPreviouslySetup = useCallback(() => {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (!storedData) return false;
            
            const parsedData = JSON.parse(storedData);
            const tokenTimestamp = parsedData.timestamp || 0;
            const tokenAge = Date.now() - tokenTimestamp;
            const isTokenFresh = tokenAge < (50 * 24 * 60 * 60 * 1000); // 50 days
            
            return parsedData.registered && parsedData.token && isTokenFresh;
        } catch (error) {
            console.error('Error checking notification setup status:', error);
            return false;
        }
    }, []);

    // Store setup information persistently
    const storeSetupInfo = useCallback((token) => {
        try {
            const setupInfo = {
                registered: true,
                token,
                timestamp: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(setupInfo));
            return true;
        } catch (error) {
            console.error('Error storing notification setup info:', error);
            return false;
        }
    }, []);

    const saveToken = useCallback(async (token) => {
        if (!token) return false;
        
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                throw new Error('User ID not found');
            }

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collectionName: COLLECTION_NAME,
                    docId: userId,
                    token: token
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving token:', error);
            throw error;
        }
    }, []);

    // Function to handle browser compatibility checks
    const checkBrowserCompatibility = useCallback(() => {
        // Check browser compatibility with detailed logging
        const isServiceWorkerSupported = 'serviceWorker' in navigator;
        const isPushSupported = 'PushManager' in window;
        const isNotificationSupported = 'Notification' in window;
        
        addDebugInfo(`Browser compatibility check:
          - Service Worker supported: ${isServiceWorkerSupported}
          - Push API supported: ${isPushSupported}
          - Notification API supported: ${isNotificationSupported}`);

        // Handle compatibility issues
        if (!isServiceWorkerSupported) {
            return {
                compatible: false,
                error: 'Service workers are not supported on this browser.'
            };
        }
        
        if (!isPushSupported) {
            return {
                compatible: false,
                error: 'Push API is not supported on this browser.'
            };
        }
        
        if (!isNotificationSupported) {
            return {
                compatible: false,
                error: 'Notification API is not supported on this browser.'
            };
        }

        return { compatible: true };
    }, [addDebugInfo]);

    // Function to request notification permission
    const requestNotificationPermission = useCallback(async () => {
        try {
            if (!('Notification' in window)) {
                throw new Error('Notifications not supported');
            }
            
            addDebugInfo('Requesting notification permission...');
            const permission = await Notification.requestPermission();
            addDebugInfo(`Permission request result: ${permission}`);
            
            return permission === 'granted';
        } catch (error) {
            addDebugInfo(`Error requesting permission: ${error.message}`);
            throw error;
        }
    }, [addDebugInfo]);

    // Register service worker and get FCM token
    const setupPushNotifications = useCallback(async () => {
        try {
            // Check if service worker is already registered
            const existingRegistration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
            let registration = existingRegistration;
            
            if (existingRegistration) {
                addDebugInfo('Service Worker already registered');
            } else {
                // Register new service worker with scope
                registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                    scope: '/'
                });
                addDebugInfo('Service Worker registered successfully');
            }
            
            // Ensure service worker is active
            if (registration.installing) {
                addDebugInfo('Service worker installing, waiting for activation...');
                await new Promise((resolve) => {
                    registration.installing.addEventListener('statechange', (event) => {
                        if (event.target.state === 'activated') {
                            addDebugInfo('Service worker activated');
                            resolve();
                        }
                    });
                });
            }
            
            // Generate FCM token
            const token = await generateToken();
            addDebugInfo('FCM token generated successfully');
            
            // Save token to server
            await saveToken(token);
            storeSetupInfo(token);
            
            return true;
        } catch (error) {
            addDebugInfo(`Setup error: ${error.message}`);
            throw error;
        }
    }, [addDebugInfo, saveToken, storeSetupInfo]);

    // Handler for user action button (Safari requirement)
    const handleEnableNotifications = async () => {
        try {
            setNotificationState(prev => ({
                ...prev,
                loading: true,
                visible: true,
                userAction: true
            }));
            
            // Check compatibility first
            const compatibilityResult = checkBrowserCompatibility();
            if (!compatibilityResult.compatible) {
                throw new Error(compatibilityResult.error);
            }
            
            // Request permission (direct user action for Safari)
            const permissionGranted = await requestNotificationPermission();
            if (!permissionGranted) {
                throw new Error('Notification permission denied by user');
            }
            
            // Setup push notifications
            await setupPushNotifications();
            
            setNotificationState(prev => ({
                ...prev,
                loading: false,
                success: true,
                error: null
            }));
            
        } catch (error) {
            setNotificationState(prev => ({
                ...prev,
                loading: false,
                success: false,
                error: error.message
            }));
        }
    };

    // Auto-setup for browsers that don't require user action
    useEffect(() => {
        // Skip if we've already attempted setup or if browser requires user action
        if (setupAttemptedRef.current || browserInfo.requiresUserAction) return;
        
        // Skip for iOS not in standalone mode
        if (browserInfo.isIOS && !browserInfo.isInStandaloneMode) return;
        
        // Skip if already set up
        if (isPreviouslySetup()) {
            addDebugInfo('Notification setup already completed');
            setNotificationState(prev => ({
                ...prev,
                success: true,
                visible: true
            }));
            return;
        }
        
        setupAttemptedRef.current = true;
        
        const autoSetup = async () => {
            try {
                setNotificationState(prev => ({
                    ...prev,
                    loading: true,
                    visible: true
                }));
                
                // Check compatibility
                const compatibilityResult = checkBrowserCompatibility();
                if (!compatibilityResult.compatible) {
                    throw new Error(compatibilityResult.error);
                }
                
                // Request permission (works on non-Safari browsers)
                const permissionGranted = await requestNotificationPermission();
                if (!permissionGranted) {
                    throw new Error('Notification permission denied by user');
                }
                
                // Setup push notifications
                await setupPushNotifications();
                
                setNotificationState(prev => ({
                    ...prev,
                    loading: false,
                    success: true,
                    error: null
                }));
                
            } catch (error) {
                setNotificationState(prev => ({
                    ...prev,
                    loading: false,
                    success: false,
                    error: error.message
                }));
            }
        };
        
        // Run auto-setup with a small delay
        const timer = setTimeout(() => {
            autoSetup();
        }, 500);
        
        return () => clearTimeout(timer);
    }, [browserInfo, isPreviouslySetup, checkBrowserCompatibility, requestNotificationPermission, setupPushNotifications, addDebugInfo]);

    // Effect for auto-closing notifications
    useEffect(() => {
        if (notificationState.visible && 
            (notificationState.success || notificationState.error) && 
            !notificationState.showInstallInstructions) {
            
            notificationTimerRef.current = setTimeout(hideNotification, NOTIFICATION_TIMEOUT);
        }
        
        return () => {
            if (notificationTimerRef.current) {
                clearTimeout(notificationTimerRef.current);
            }
        };
    }, [notificationState.visible, notificationState.success, notificationState.error, 
        notificationState.showInstallInstructions, hideNotification]);

    // iOS NOT in standalone mode - show add to home screen instructions
    if (browserInfo.isIOS && !browserInfo.isInStandaloneMode) {
        return (
            <div className="notification-setup">
                {notificationState.showInstallInstructions && notificationState.visible && (
                    <div 
                        className="notification-banner" 
                        role="alert"
                        aria-labelledby="install-instructions-title"
                    >
                        <button 
                            className="notification-close"
                            onClick={handleCloseNotification}
                            aria-label="Close notification"
                        >
                            ×
                        </button>
                        <h4 id="install-instructions-title">To receive notifications:</h4>
                        <p>
                            On iPhone, tap the <strong>Share</strong> button (up arrow icon) and select
                            <strong> "Add to Home Screen"</strong>. Then, open the app from your home screen.
                        </p>
                    </div>
                )}
            </div>
        );
    }
    
    // Safari (iOS standalone or macOS) - show button for user action
    if (browserInfo.requiresUserAction && !isPreviouslySetup()) {
        return (
            <div className="notification-setup safari-mode">
                <div className="notification-prompt">
                    <h4>Enable Push Notifications</h4>
                    <p>Stay informed with real-time updates and important alerts.</p>
                    <button 
                        className="enable-notifications-btn"
                        onClick={handleEnableNotifications}
                        disabled={notificationState.loading}
                    >
                        {notificationState.loading ? 'Setting up...' : 'Enable Notifications'}
                    </button>
                </div>
                
                {notificationState.loading && (
                    <div className="notification-loading" role="status">
                        Setting up notifications...
                    </div>
                )}
                
                {notificationState.error && notificationState.visible && (
                    <div className="notification-error" role="alert">
                        <button 
                            className="notification-close"
                            onClick={handleCloseNotification}
                            aria-label="Close notification"
                        >
                            ×
                        </button>
                        <strong>Notification Setup Error:</strong> {notificationState.error}
                        {notificationState.debugInfo && (
                            <div className="notification-debug">
                                <pre>{notificationState.debugInfo}</pre>
                            </div>
                        )}
                    </div>
                )}
                
                {notificationState.success && notificationState.visible && (
                    <div className="notification-success" role="status">
                        <button 
                            className="notification-close"
                            onClick={handleCloseNotification}
                            aria-label="Close notification"
                        >
                            ×
                        </button>
                        <strong>Notifications Enabled!</strong>
                        <p>You'll now receive important updates and alerts.</p>
                    </div>
                )}
            </div>
        );
    }
    
    // ALL OTHER BROWSERS or ALREADY SETUP - just show status
    return (
        <div className="notification-setup">
            {notificationState.loading && notificationState.visible && (
                <div className="notification-loading" aria-live="polite">
                    Setting up notifications...
                </div>
            )}
            
            {notificationState.error && notificationState.visible && (
                <div className="notification-error" role="alert">
                    <button 
                        className="notification-close"
                        onClick={handleCloseNotification}
                        aria-label="Close notification"
                    >
                        ×
                    </button>
                    Unable to set up notifications: {notificationState.error}
                    {notificationState.debugInfo && (
                        <div className="notification-debug">
                            <pre>{notificationState.debugInfo}</pre>
                        </div>
                    )}
                </div>
            )}
            
            {notificationState.success && notificationState.visible && (
                <div className="notification-success" role="status">
                    <button 
                        className="notification-close"
                        onClick={handleCloseNotification}
                        aria-label="Close notification"
                    >
                        ×
                    </button>
                    Notifications set up successfully!
                </div>
            )}
        </div>
    );
};

export default NotificationSetup;