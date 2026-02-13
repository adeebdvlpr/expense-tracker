import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Typography,
  Box 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ExpenseList = ({ expenses, onDeleteExpense }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body1">No expenses found. Add some expenses to get started!</Typography>
      </Box>
    );
  }

  return (
    <List>
      {expenses.map((expense) => (
        <ListItem key={expense._id}>
          <ListItemText
            primary={expense.description || 'No description'}
            secondary={
              <React.Fragment>
                <Typography component="span" variant="body2" color="text.primary">
                  ${typeof expense.amount === 'number' ? expense.amount.toFixed(2) : '0.00'}
                </Typography>
                {" — "}{expense.category || 'Uncategorized'}
              </React.Fragment>
            }
          />
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="delete" onClick={() => onDeleteExpense(expense._id)}>
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default ExpenseList;