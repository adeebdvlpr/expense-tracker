import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  Divider,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import { getNotifications, markNotificationRead, markAllNotificationsRead, dismissNotification } from '../utils/api';

const NOTIFICATION_ROUTES = {
  ai_prediction: '/predictions',
  onboarding_checklist: '/account',
};

function relativeTime(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)} days ago`;
}

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (_) {
      // silent — bell is ambient
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    window.addEventListener('ledgic:expense-saved', fetchNotifications);
    window.addEventListener('ledgic:checklist-created', fetchNotifications);
    return () => {
      clearInterval(interval);
      window.removeEventListener('ledgic:expense-saved', fetchNotifications);
      window.removeEventListener('ledgic:checklist-created', fetchNotifications);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleClickNotification = async (n) => {
    // Mark as read
    if (!n.read) {
      try {
        await markNotificationRead(n._id);
        setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
      } catch (_) {}
    }
    // Navigate if this type has a destination
    const route = NOTIFICATION_ROUTES[n.type];
    if (route) {
      handleClose();
      navigate(route);
    }
  };

  const handleDismiss = async (e, n) => {
    e.stopPropagation();
    try {
      await dismissNotification(n._id);
      setNotifications((prev) => prev.filter((x) => x._id !== n._id));
    } catch (_) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((x) => ({ ...x, read: true })));
    } catch (_) {}
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={handleOpen} size="small" aria-label="Notifications">
        <Badge
          badgeContent={unreadCount > 9 ? '9+' : unreadCount}
          color="error"
          invisible={unreadCount === 0}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        elevation={2}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxHeight: 480,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.25,
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
            flexShrink: 0,
          }}
        >
          <Typography variant="body2" fontWeight={700}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead} sx={{ textTransform: 'none', p: 0 }}>
              Mark all read
            </Button>
          )}
        </Box>

        {/* Body */}
        <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {notifications.map((n, idx) => {
                const isClickable = !n.read || !!NOTIFICATION_ROUTES[n.type];
                return (
                  <React.Fragment key={n._id}>
                    {idx > 0 && <Divider component="li" />}
                    <ListItem
                      alignItems="flex-start"
                      onClick={() => handleClickNotification(n)}
                      secondaryAction={
                        <Tooltip title="Dismiss">
                          <IconButton
                            size="small"
                            onClick={(e) => handleDismiss(e, n)}
                            sx={{ color: 'text.disabled', '&:hover': { color: 'text.secondary' } }}
                          >
                            <CloseIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      }
                      sx={{
                        cursor: isClickable ? 'pointer' : 'default',
                        borderLeft: n.read ? 'none' : '3px solid',
                        borderColor: 'primary.main',
                        pr: 5,
                        px: 2,
                        py: 1,
                        '&:hover': { bgcolor: isClickable ? 'action.hover' : 'transparent' },
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
                          <Typography variant="body2" fontWeight={n.read ? 400 : 600} sx={{ flexGrow: 1 }}>
                            {n.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                            {relativeTime(n.createdAt)}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {n.message}
                        </Typography>
                        {NOTIFICATION_ROUTES[n.type] && (
                          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
                            View →
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
