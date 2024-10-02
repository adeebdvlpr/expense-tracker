// import React from 'react'; V1

// const ExpenseList = ({ expenses, onDeleteExpense }) => {
//   return (
//     <ul className="expense-list">
//       {expenses.map((expense) => (
//         <li key={expense._id} className="expense-item">
//           <span>{expense.description} - ${expense.amount.toFixed(2)} - {expense.category}</span>
//           <button onClick={() => onDeleteExpense(expense._id)}>Delete</button>
//         </li>
//       ))}
//     </ul>
//   );
// };

// export default ExpenseList;

//V3
// import React from 'react';
// import { 
//   List, 
//   ListItem, 
//   ListItemText, 
//   ListItemSecondaryAction, 
//   IconButton, 
//   Typography,
//   Box 
// } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';

// const ExpenseList = ({ expenses, onDeleteExpense }) => {
//   if (!expenses || expenses.length === 0) {
//     return (
//       <Box sx={{ textAlign: 'center', py: 2 }}>
//         <Typography variant="body1">No expenses found. Add some expenses to get started!</Typography>
//       </Box>
//     );
//   }

//   return (
//     <List>
//       {expenses.map((expense) => (
//         <ListItem key={expense._id}>
//           <ListItemText
//             primary={expense.description}
//             secondary={
//               <React.Fragment>
//                 <Typography component="span" variant="body2" color="text.primary">
//                   ${expense.amount.toFixed(2)}
//                 </Typography>
//                 {" — "}{expense.category}
//               </React.Fragment>
//             }
//           />
//           <ListItemSecondaryAction>
//             <IconButton edge="end" aria-label="delete" onClick={() => onDeleteExpense(expense._id)}>
//               <DeleteIcon />
//             </IconButton>
//           </ListItemSecondaryAction>
//         </ListItem>
//       ))}
//     </List>
//   );
// };

// export default ExpenseList;

// import React from 'react'; V2
// import { 
//   List, 
//   ListItem, 
//   ListItemText, 
//   ListItemSecondaryAction, 
//   IconButton, 
//   Typography 
// } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';

// const ExpenseList = ({ expenses, onDeleteExpense }) => {
//   return (
//     <List>
//       {expenses.map((expense) => (
//         <ListItem key={expense._id}>
//           <ListItemText
//             primary={expense.description}
//             secondary={
//               <React.Fragment>
//                 <Typography component="span" variant="body2" color="text.primary">
//                   ${expense.amount.toFixed(2)}
//                 </Typography>
//                 {" — "}{expense.category}
//               </React.Fragment>
//             }
//           />
//           <ListItemSecondaryAction>
//             <IconButton edge="end" aria-label="delete" onClick={() => onDeleteExpense(expense._id)}>
//               <DeleteIcon />
//             </IconButton>
//           </ListItemSecondaryAction>
//         </ListItem>
//       ))}
//     </List>
//   );
// };

// export default ExpenseList;

//V4
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
        <ListItem key={expense._id || Math.random().toString()}>
          <ListItemText
            primary={expense.description || 'No description'}
            secondary={
              <React.Fragment>
                <Typography component="span" variant="body2" color="text.primary">
                  ${typeof expense.amount === 'number' && !isNaN(expense.amount) 
                    ? expense.amount.toFixed(2) 
                    : '0.00'}
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