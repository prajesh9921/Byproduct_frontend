import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import QRCode from 'qrcode.react';
import {QRCodeSVG} from 'qrcode.react';

// Admin Components
const AdminDashboard = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: ''
  });

  useEffect(() => {
    fetchMenuItems();
    fetchOrders();
    console.log(process.env.REACT_APP_API_URL);
    
  }, []);

  const fetchMenuItems = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/menu-items`);
    const data = await response.json();
    setMenuItems(data);
  };

  const fetchOrders = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`);
    const data = await response.json();
    setOrders(data);
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newItem.name);
    formData.append('description', newItem.description);
    formData.append('price', newItem.price);
    
    await fetch(`${process.env.REACT_APP_API_URL}/api/menu-items`, {
      method: 'POST',
      body: formData
    });

    fetchMenuItems();
    // Reset form
    setNewItem({ name: '', description: '', price: '' });
  };

  const updateOrderStatus = async (orderId, status) => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchOrders();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      
      {/* Add Menu Item Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Add Menu Item</h2>
        <form onSubmit={handleAddMenuItem} className="space-y-2">
          <input 
            type="text" 
            placeholder="Name" 
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            className="w-full p-2 border rounded"
            required 
          />
          <textarea 
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({...newItem, description: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
          <input 
            type="number" 
            placeholder="Price" 
            value={newItem.price}
            onChange={(e) => setNewItem({...newItem, price: e.target.value})}
            className="w-full p-2 border rounded"
            step="0.01"
            required 
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white p-2 rounded"
          >
            Add Item
          </button>
        </form>
      </div>

      {/* Menu Items List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Current Menu Items</h2>
        <div className="grid grid-cols-3 gap-4">
          {menuItems.map(item => (
            <div key={item._id} className="border p-4 rounded">
              <h3 className="font-bold">{item.name}</h3>
              <p>{item.description}</p>
              <p className="font-semibold">${item.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Current Orders</h2>
        {orders.map(order => (
          <div key={order._id} className="border p-4 rounded mb-4">
            <div className="flex justify-between items-center">
              <div>
                {order.items.map(item => (
                  <div key={item._id}>
                    {item.menuItem.name} x {item.quantity}
                  </div>
                ))}
                <p className="font-bold">Total: ${order.totalPrice.toFixed(2)}</p>
              </div>
              <div>
                <select 
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Customer Menu Component
const CustomerMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/menu-items`);
    const data = await response.json();
    setMenuItems(data);
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.menuItemId === item._id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.menuItemId === item._id 
          ? {...cartItem, quantity: cartItem.quantity + 1} 
          : cartItem
      ));
    } else {
      setCart([...cart, { menuItemId: item._id, quantity: 1, name: item.name, price: item.price }]);
    }
  };

  const placeOrder = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.map(item => ({ 
          menuItemId: item.menuItemId, 
          quantity: item.quantity 
        })) })
      });
      setCart([]);
      alert('Order placed successfully!');
    } catch (error) {
      alert('Failed to place order');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Menu</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {menuItems.map(item => (
          <div key={item._id} className="border p-4 rounded">
            <h3 className="font-bold">{item.name}</h3>
            <p>{item.description}</p>
            <p className="font-semibold">${item.price.toFixed(2)}</p>
            <button 
              onClick={() => addToCart(item)}
              className="mt-2 bg-green-500 text-white p-2 rounded"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
          <h2 className="text-xl font-semibold">Cart</h2>
          {cart.map(item => (
            <div key={item.menuItemId} className="flex justify-between">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="font-bold">
            Total: ${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
          </div>
          <button 
            onClick={placeOrder}
            className="mt-2 bg-blue-500 text-white p-2 rounded w-full"
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
};

// QR Code Display Component
const QRCodeDisplay = () => {
  // const menuUrl = `${window.location.origin}/menu`;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl mb-4">Scan to View Menu</h1>
      {/* <QRCode value={menuUrl} size={256} /> */}
      <QRCodeSVG value="https://byproduct-backend.onrender.com/menu" size={256}/>
      <p className="mt-4">Scan this QR code to access the restaurant menu</p>
    </div>
  );
};

// Main App Component with Routing
const App = () => {
  return (
    <Router>
      <div>
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-white text-xl font-bold">Restaurant App</Link>
            <div>
              <Link to="/admin" className="text-white mr-4">Admin</Link>
              <Link to="/qr" className="text-white">QR Code</Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/menu" element={<CustomerMenu />} />
          <Route path="/qr" element={<QRCodeDisplay />} />
        </Routes>

      <QRCodeDisplay/>
      </div>
    </Router>
  );
};

export default App;