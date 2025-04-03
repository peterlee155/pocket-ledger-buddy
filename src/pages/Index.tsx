
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ArrowUp, ArrowDown, DollarSign, PieChart as PieChartIcon, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('general');
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [filter, setFilter] = useState('all');

  // Income categories
  const incomeCategories = ['salary', 'freelance', 'investment', 'gift', 'other'];
  
  // Expense categories
  const expenseCategories = ['food', 'housing', 'transportation', 'entertainment', 'utilities', 'healthcare', 'education', 'shopping', 'other'];
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      try {
        const parsedTransactions = JSON.parse(savedTransactions);
        setTransactions(parsedTransactions);
        calculateBalance(parsedTransactions);
      } catch (error) {
        console.error('Error parsing saved transactions:', error);
        toast({
          title: "Error",
          description: "Failed to load saved transactions.",
          variant: "destructive"
        });
      }
    }
  }, []);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Calculate balance, income, and expenses
  const calculateBalance = (transactionsList) => {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactionsList.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += parseFloat(transaction.amount);
      } else {
        totalExpenses += parseFloat(transaction.amount);
      }
    });

    setIncome(totalIncome);
    setExpenses(totalExpenses);
    setBalance(totalIncome - totalExpenses);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description || !amount) {
      toast({
        title: "Error",
        description: "Please enter both description and amount.",
        variant: "destructive"
      });
      return;
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid positive amount.",
        variant: "destructive"
      });
      return;
    }

    const newTransaction = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString(),
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    calculateBalance(updatedTransactions);

    // Reset form
    setDescription('');
    setAmount('');

    toast({
      title: "Success",
      description: `${type === 'income' ? 'Income' : 'Expense'} added successfully!`,
      variant: "default"
    });
  };

  // Delete a transaction
  const deleteTransaction = (id) => {
    const updatedTransactions = transactions.filter(transaction => transaction.id !== id);
    setTransactions(updatedTransactions);
    calculateBalance(updatedTransactions);

    toast({
      title: "Success",
      description: "Transaction deleted successfully!",
      variant: "default"
    });
  };

  // Filter transactions
  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(transaction => transaction.type === filter);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format amount as currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Prepare data for pie chart
  const prepareChartData = () => {
    if (transactions.length === 0) return [];

    const expenseData = {};
    const incomeData = {};

    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        if (expenseData[transaction.category]) {
          expenseData[transaction.category] += parseFloat(transaction.amount);
        } else {
          expenseData[transaction.category] = parseFloat(transaction.amount);
        }
      } else {
        if (incomeData[transaction.category]) {
          incomeData[transaction.category] += parseFloat(transaction.amount);
        } else {
          incomeData[transaction.category] = parseFloat(transaction.amount);
        }
      }
    });

    const chartData = [];

    if (filter === 'all' || filter === 'expense') {
      Object.keys(expenseData).forEach(category => {
        chartData.push({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          value: expenseData[category],
          type: 'expense'
        });
      });
    }

    if (filter === 'all' || filter === 'income') {
      Object.keys(incomeData).forEach(category => {
        chartData.push({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          value: incomeData[category],
          type: 'income'
        });
      });
    }

    return chartData;
  };

  const chartData = prepareChartData();
  
  // Colors for chart
  const COLORS = {
    expense: ['#f87171', '#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239'],
    income: ['#4ade80', '#34d399', '#10b981', '#059669', '#047857', '#065f46']
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-2">Pocket Ledger Buddy</h1>
          <p className="text-gray-600">Track your income and expenses with ease</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-gray-700" />
                <span className={`text-2xl font-bold ${balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  {formatCurrency(balance)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ArrowUp className="h-5 w-5 mr-2 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{formatCurrency(income)}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ArrowDown className="h-5 w-5 mr-2 text-red-600" />
                <span className="text-2xl font-bold text-red-600">{formatCurrency(expenses)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <Card className="bg-white shadow-sm lg:col-span-1">
            <CardHeader>
              <CardTitle>Add Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      type="button"
                      variant={type === 'income' ? 'default' : 'outline'} 
                      className={`w-full ${type === 'income' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      onClick={() => setType('income')}
                    >
                      <ArrowUp className="h-4 w-4 mr-2" /> Income
                    </Button>
                    
                    <Button 
                      type="button"
                      variant={type === 'expense' ? 'default' : 'outline'} 
                      className={`w-full ${type === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                      onClick={() => setType('expense')}
                    >
                      <ArrowDown className="h-4 w-4 mr-2" /> Expense
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    placeholder="What was it for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {type === 'income'
                        ? incomeCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                          ))
                        : expenseCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className={`w-full ${type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  Add {type === 'income' ? 'Income' : 'Expense'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Transactions and Chart Section */}
          <Card className="bg-white shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="list" className="w-full">
                <div className="px-6 pt-2 border-b">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="chart">Chart</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="list" className="p-0">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-medium">Transaction History</h3>
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expenses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredTransactions.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {filteredTransactions.map((transaction) => (
                          <li key={transaction.id} className="px-4 py-3 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span 
                                  className={`inline-flex items-center justify-center rounded-full w-8 h-8 mr-3 
                                    ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                >
                                  {transaction.type === 'income' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                </span>
                                <div>
                                  <p className="font-medium text-gray-900">{transaction.description}</p>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <span className="capitalize">{transaction.category}</span>
                                    <span className="mx-1">•</span>
                                    <span>{formatDate(transaction.date)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <span 
                                  className={`mr-4 font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                                >
                                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                                  onClick={() => deleteTransaction(transaction.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-gray-500">No transactions found</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="chart" className="px-4 pt-4 pb-6">
                  <div className="mb-4">
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expenses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {chartData.length > 0 ? (
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {chartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.type === 'income' 
                                  ? COLORS.income[index % COLORS.income.length] 
                                  : COLORS.expense[index % COLORS.expense.length]
                                } 
                              />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip 
                            formatter={(value) => formatCurrency(value)} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <PieChartIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No data to display</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="text-sm text-gray-500 border-t">
              {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'} in total
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
