// import React, { useState } from 'react';

// const ExpenseForm = ({ onAddExpense }) => {
//   const [description, setDescription] = useState('');
//   const [amount, setAmount] = useState('');
//   const [category, setCategory] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!description || !amount || !category) return;
//     onAddExpense({ description, amount: parseFloat(amount), category });
//     setDescription('');
//     setAmount('');
//     setCategory('');
//   };

//   return (
//     <form className="expense-form" onSubmit={handleSubmit}>
//       <input
//         type="text"
//         placeholder="Description"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//       />
//       <input
//         type="number"
//         placeholder="Amount"
//         value={amount}
//         onChange={(e) => setAmount(e.target.value)}
//       />
//       <select value={category} onChange={(e) => setCategory(e.target.value)}>
//         <option value="">Select Category</option>
//         <option value="Food">Food</option>
//         <option value="Travel">Travel</option>
//         <option value="Utilities">Utilities</option>
//         <option value="Entertainment">Entertainment</option>
//       </select>
//       <button type="submit">Add Expense</button>
//     </form>
//   );
// };

// export default ExpenseForm;

import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Box 
} from '@mui/material';

const ExpenseForm = ({ onAddExpense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount || !category) return;
    onAddExpense({ description, amount: parseFloat(amount), category });
    setDescription('');
    setAmount('');
    setCategory('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        required
      />
      <TextField
        label="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        fullWidth
        required
      />
      <FormControl fullWidth required>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <MenuItem value="Food">Food</MenuItem>
          <MenuItem value="Travel">Travel</MenuItem>
          <MenuItem value="Utilities">Utilities</MenuItem>
          <MenuItem value="Entertainment">Entertainment</MenuItem>
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" color="primary">
        Add Expense
      </Button>
    </Box>
  );
};

export default ExpenseForm;