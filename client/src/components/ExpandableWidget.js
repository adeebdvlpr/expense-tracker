import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';

const ExpandableWidget = ({ children, expandedContent, title, expandIcon }) => {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ position: 'relative' }}>
      {children}

      <IconButton
        size="small"
        onClick={() => setOpen(true)}
        aria-label={`Expand ${title}`}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          p: 0.5,
          opacity: 0.45,
          '&:hover': { opacity: 1 },
          zIndex: 1,
        }}
      >
        {expandIcon || <OpenInFullIcon sx={{ fontSize: 15 }} />}
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '14px' } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: 1.5,
          }}
        >
          {title}
          <IconButton size="small" onClick={() => setOpen(false)} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {expandedContent}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ExpandableWidget;
