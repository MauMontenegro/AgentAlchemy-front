import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import useAuthenticatedFetch from './useAuthenticatedFetch';

const AdminPanel = () => {
  const { user } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    role: 'user',
    password: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from /users/');
      const response = await authenticatedFetch('/users/');
      
      // Parse the response as JSON if it hasn't been parsed already
      const data = response && typeof response.json === 'function' 
        ? await response.json() 
        : response;
      
      console.log('Parsed users data:', data);
      
      // Handle different possible response formats
      const usersData = Array.isArray(data) 
        ? data 
        : (data?.data || []);
      
      console.log('Processed users list:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Failed to load users', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle create user
  const handleCreateUser = async (userData) => {
    try {
      await authenticatedFetch('/users/', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      showNotification('User created successfully');
      setIsCreatingNew(false);
      setNewUser({ username: '', email: '', role: 'user', password: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      showNotification(error.message || 'Failed to create user', 'error');
    }
  };

  // Handle update user
  const handleUpdateUser = async (userData) => {
    try {
      await authenticatedFetch(`/users/${userData.id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
      
      showNotification('User updated successfully');
      setEditingUserId(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification(error.message || 'Failed to update user', 'error');
    }
  };

  // Handle field change for in-place editing
  const handleFieldChange = (userId, field, value) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, [field]: value } : user
    ));
  };

  // Toggle edit mode for a user
  const toggleEdit = (userId) => {
    setEditingUserId(editingUserId === userId ? null : userId);
  };

  // Save changes for a user
  const saveUserChanges = (user) => {
    if (isCreatingNew) {
      handleCreateUser(user);
    } else {
      handleUpdateUser(user);
    }
  };

  // Handle new user input change
  const handleNewUserChange = (field, value) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };

  // Start creating a new user
  const startCreateUser = () => {
    setIsCreatingNew(true);
  };

  // Cancel creating a new user
  const cancelCreateUser = () => {
    setIsCreatingNew(false);
    setNewUser({ username: '', email: '', role: 'user', password: '' });
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await authenticatedFetch(`/users/${userId}`, {
          method: 'DELETE'
        });
        
        showNotification('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showNotification(error.message || 'Failed to delete user', 'error');
      }
    }
  };

  // Filter users based on search term
  const filteredUsers = Array.isArray(users) ? users.filter(u => 
    (u?.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ) : [];

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-md ${
          notification.type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'
        } border`}>
          {notification.message}
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            <p className="text-gray-600">Welcome back, {user?.username}</p>
          </div>
          <button
            onClick={startCreateUser}
            disabled={isCreatingNew}
            className={`px-4 py-2 rounded-md text-white ${isCreatingNew ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            New User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg 
                className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              {isCreatingNew && (
                <thead className="bg-gray-50">
                  <tr>
                    <th colSpan="5" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New User
                    </th>
                  </tr>
                </thead>
              )}
              {isCreatingNew && (
                <tr className="bg-white border-b border-gray-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                        {newUser.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="ml-4">
                        <input
                          type="text"
                          placeholder="Username"
                          value={newUser.username}
                          onChange={(e) => handleNewUserChange('username', e.target.value)}
                          className="text-sm border rounded px-2 py-1 w-full"
                          required
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="email"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={(e) => handleNewUserChange('email', e.target.value)}
                      className="text-sm border rounded px-2 py-1 w-full"
                      required
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={newUser.role}
                      onChange={(e) => handleNewUserChange('role', e.target.value)}
                      className="text-sm border rounded px-2 py-1 w-full"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="password"
                      placeholder="Password"
                      value={newUser.password}
                      onChange={(e) => handleNewUserChange('password', e.target.value)}
                      className="text-sm border rounded px-2 py-1 w-full"
                      required
                      minLength={6}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => saveUserChanges(newUser)}
                      className="text-green-600 hover:text-green-900"
                      disabled={!newUser.username || !newUser.email || !newUser.password}
                    >
                      Create
                    </button>
                    <button
                      onClick={cancelCreateUser}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              )}
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {userItem.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="ml-4">
                          {editingUserId === userItem.id ? (
                            <input
                              type="text"
                              value={userItem.username || ''}
                              onChange={(e) => handleFieldChange(userItem.id, 'username', e.target.value)}
                              className="text-sm border rounded px-2 py-1 w-full"
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">{userItem.username}</div>
                          )}
                          <div className="text-xs text-gray-500">ID: {userItem.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === userItem.id ? (
                        <input
                          type="email"
                          value={userItem.email || ''}
                          onChange={(e) => handleFieldChange(userItem.id, 'email', e.target.value)}
                          className="text-sm border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <span className="text-sm text-gray-500">{userItem.email}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === userItem.id ? (
                        <select
                          value={userItem.role || 'user'}
                          onChange={(e) => handleFieldChange(userItem.id, 'role', e.target.value)}
                          className="text-sm border rounded px-2 py-1 w-full"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {userItem.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {editingUserId === userItem.id ? (
                        <>
                          <button
                            onClick={() => saveUserChanges(userItem)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleEdit(userItem.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          {userItem.id !== user.id && (
                            <button
                              onClick={() => handleDeleteUser(userItem.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


    </div>
  );
};

export default AdminPanel;