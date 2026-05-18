import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { RestaurantDetails } from './pages/RestaurantDetails';
import { Dashboard } from './pages/Dashboard';
import { MyOrders } from './pages/MyOrders';
import { DeliveryPanel } from './pages/DeliveryPanel';
import { LiveOrders } from './pages/LiveOrders';
import { CreateRestaurant } from './pages/CreateRestaurant';
import { ManageMenu } from './pages/ManageMenu';
import { RestaurantHistory } from './pages/RestaurantHistory';
import { CustomerHistory } from './pages/CustomerHistory';
import { DeliveryHistory } from './pages/DeliveryHistory';
import { Profile } from './pages/Profile';
import { CartDrawer } from './components/CartDrawer';

function App() {
  return (
    <>
      <CartDrawer />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/restaurant/new" element={<CreateRestaurant />} />
      <Route path="/restaurant/:id" element={<RestaurantDetails />} />
      <Route path="/dashboard/:restaurantId" element={<Dashboard />} />
      <Route path="/restaurant/:restaurantId/live" element={<LiveOrders />} />
      <Route path="/restaurant/:restaurantId/menu" element={<ManageMenu />} />
      <Route path="/restaurant/:restaurantId/history" element={<RestaurantHistory />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/my-history" element={<CustomerHistory />} />
      <Route path="/delivery" element={<DeliveryPanel />} />
      <Route path="/delivery/history" element={<DeliveryHistory />} />
    </Routes>
    </>
  );
}

export default App
