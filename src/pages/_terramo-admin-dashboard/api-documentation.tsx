/*

API DOCUMENTATION
PROJECT : TERRAMO TOOL
DESCRIPTION: DOCUMENTATION OF API ENDPOINTS EXISTS HERE IN THE APPLICATION.
CREATED BY: CHRISTOPHER
*/
import { useState } from 'react';
import { Trash2, Edit2, Plus, GripVertical, Check, X, Settings, Copy, ExternalLink } from 'lucide-react';

const initialEndpointsData = {
  Authentication: [
    { 
      id: 'auth1', 
      index: 1, 
      method: 'POST',
      endpoint: '/api/auth/', 
      description: 'Terramo Admin login endpoint',
      frontendUrl: '/login',
      backendPath: '',
      requestBody: '{ email: string, password: string }',
      responseBody: '{ token: string, user: {...} }',
      isActive: true 
    },
    { 
      id: 'auth2', 
      index: 2, 
      method: 'GET',
      endpoint: '/api/client/request-login/', 
      description: 'Request login token through email',
      frontendUrl: '/client-admin/request-login',
      backendPath: '/core_apps/client/',
      requestBody: '{ email: string, password: string, name: string }',
      responseBody: '{ message: string, userId: string }',
      isActive: true 
    },
    { 
      id: 'auth2', 
      index: 2, 
      method: 'POST',
      endpoint: '/api/client/request-login/', 
      description: 'Request login token through email',
      frontendUrl: '/client-admin/request-login',
      backendPath: '/core_apps/client/',
      requestBody: '{ email: string, password: string, name: string }',
      responseBody: '{ message: string, userId: string }',
      isActive: true 
    },
  ],
  Users: [
    { 
      id: 'user1', 
      index: 1, 
      method: 'GET',
      endpoint: '/api/users', 
      description: 'Get all users with pagination',
      frontendUrl: '/admin/users',
      backendPath: 'src/controllers/users/getAll.controller.ts',
      requestBody: 'Query: { page: number, limit: number }',
      responseBody: '{ users: [...], total: number, page: number }',
      isActive: true 
    },
    { 
      id: 'user2', 
      index: 2, 
      method: 'GET',
      endpoint: '/api/users/:id', 
      description: 'Get user by ID',
      frontendUrl: '/profile/:id',
      backendPath: 'src/controllers/users/getById.controller.ts',
      requestBody: 'Params: { id: string }',
      responseBody: '{ user: {...} }',
      isActive: true 
    },
  ],
  Products: [
    { 
      id: 'prod1', 
      index: 1, 
      method: 'GET',
      endpoint: '/api/products', 
      description: 'List all products',
      frontendUrl: '/products',
      backendPath: 'src/controllers/products/list.controller.ts',
      requestBody: 'Query: { category?: string, search?: string }',
      responseBody: '{ products: [...] }',
      isActive: true 
    },
  ],
};

const initialCategoryPrefixes = {
  Authentication: 'AUTH',
  Users: 'USR',
  Products: 'PRD',
};

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const METHOD_COLORS = {
  GET: 'bg-blue-100 text-blue-700 border-blue-300',
  POST: 'bg-green-100 text-green-700 border-green-300',
  PUT: 'bg-orange-100 text-orange-700 border-orange-300',
  PATCH: 'bg-purple-100 text-purple-700 border-purple-300',
  DELETE: 'bg-red-100 text-red-700 border-red-300',
};

const ApiDocAdmin = () => {
  const [selectedCategory, setSelectedCategory] = useState('Authentication');
  const [endpoints, setEndpoints] = useState(initialEndpointsData);
  const [categoryPrefixes, setCategoryPrefixes] = useState(initialCategoryPrefixes);
  const [draggedItem, setDraggedItem] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState({
    method: 'GET',
    endpoint: '',
    description: '',
    frontendUrl: '',
    backendPath: '',
    requestBody: '',
    responseBody: '',
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryPrefix, setNewCategoryPrefix] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, item: null });
  const [expandedEndpoint, setExpandedEndpoint] = useState(null);
  const [copiedText, setCopiedText] = useState('');

  const currentEndpoints = endpoints[selectedCategory] || [];
  const prefix = categoryPrefixes[selectedCategory] || '';

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleDragStart = (index) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    const newEndpoints = [...currentEndpoints];
    const draggedEndpoint = newEndpoints[draggedItem];
    newEndpoints.splice(draggedItem, 1);
    newEndpoints.splice(index, 0, draggedEndpoint);
    const reindexed = newEndpoints.map((ep, idx) => ({ ...ep, index: idx + 1 }));
    setEndpoints({ ...endpoints, [selectedCategory]: reindexed });
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setHasUnsavedChanges(true);
  };

  const handleDelete = (id) => {
    const endpointToDelete = currentEndpoints.find(ep => ep.id === id);
    setDeleteModal({ isOpen: true, type: 'endpoint', item: endpointToDelete });
  };

  const confirmDelete = () => {
    setHasUnsavedChanges(true);
    if (deleteModal.type === 'endpoint' && deleteModal.item) {
      const filtered = currentEndpoints.filter((ep) => ep.id !== deleteModal.item.id);
      const reindexed = filtered.map((ep, idx) => ({ ...ep, index: idx + 1 }));
      setEndpoints({ ...endpoints, [selectedCategory]: reindexed });
    } else if (deleteModal.type === 'category' && deleteModal.item) {
      const newEndpoints = { ...endpoints };
      delete newEndpoints[deleteModal.item];
      const newPrefixes = { ...categoryPrefixes };
      delete newPrefixes[deleteModal.item];
      setEndpoints(newEndpoints);
      setCategoryPrefixes(newPrefixes);
      if (selectedCategory === deleteModal.item) {
        setSelectedCategory(Object.keys(newEndpoints)[0]);
      }
    }
    setDeleteModal({ isOpen: false, type: null, item: null });
  };

  const handleEdit = (endpoint) => {
    setEditingId(endpoint.id);
    setEditData({ ...endpoint });
  };

  const handleSaveEdit = (id) => {
    setHasUnsavedChanges(true);
    const updated = currentEndpoints.map((ep) => ep.id === id ? { ...ep, ...editData } : ep);
    setEndpoints({ ...endpoints, [selectedCategory]: updated });
    setEditingId(null);
    setEditData({});
  };

  const handleToggleActive = (id) => {
    setHasUnsavedChanges(true);
    const updated = currentEndpoints.map((ep) => ep.id === id ? { ...ep, isActive: !ep.isActive } : ep);
    setEndpoints({ ...endpoints, [selectedCategory]: updated });
  };

  const handleAddNew = () => {
    if (!newEndpoint.endpoint?.trim() || !newEndpoint.description?.trim()) return;
    setHasUnsavedChanges(true);
    const newEp = {
      id: `${prefix.toLowerCase()}${Date.now()}`,
      index: currentEndpoints.length + 1,
      method: newEndpoint.method || 'GET',
      endpoint: newEndpoint.endpoint || '',
      description: newEndpoint.description || '',
      frontendUrl: newEndpoint.frontendUrl || '',
      backendPath: newEndpoint.backendPath || '',
      requestBody: newEndpoint.requestBody || '',
      responseBody: newEndpoint.responseBody || '',
      isActive: true,
    };
    setEndpoints({ ...endpoints, [selectedCategory]: [...currentEndpoints, newEp] });
    setNewEndpoint({ method: 'GET', endpoint: '', description: '', frontendUrl: '', backendPath: '', requestBody: '', responseBody: '' });
    setIsAddingNew(false);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !newCategoryPrefix.trim()) return;
    setHasUnsavedChanges(true);
    setEndpoints({ ...endpoints, [newCategoryName]: [] });
    setCategoryPrefixes({ ...categoryPrefixes, [newCategoryName]: newCategoryPrefix.toUpperCase() });
    setSelectedCategory(newCategoryName);
    setNewCategoryName('');
    setNewCategoryPrefix('');
    setShowCategoryModal(false);
  };

  const handleUpdateCategoryPrefix = () => {
    if (!newCategoryPrefix.trim()) return;
    setHasUnsavedChanges(true);
    setCategoryPrefixes({ ...categoryPrefixes, [selectedCategory]: newCategoryPrefix.toUpperCase() });
    setNewCategoryPrefix('');
    setIsEditingCategory(false);
  };

  const handleDeleteCategory = (categoryName) => {
    if (Object.keys(endpoints).length <= 1) {
      alert('Cannot delete the last category');
      return;
    }
    setDeleteModal({ isOpen: true, type: 'category', item: categoryName });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const payload = {
        categories: Object.keys(endpoints).map(categoryName => ({
          name: categoryName,
          prefix: categoryPrefixes[categoryName],
          endpoints: endpoints[categoryName].map(ep => ({ ...ep, category: categoryName }))
        }))
      };
      console.log('Saving API documentation:', JSON.stringify(payload, null, 2));
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasUnsavedChanges(false);
      alert('API documentation saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">API Documentation Admin</h1>
              <p className="text-gray-600">Manage API endpoints, methods, paths, and documentation</p>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && <span className="text-sm text-orange-600 font-medium">• Unsaved changes</span>}
              <button onClick={handleSaveAll} disabled={!hasUnsavedChanges || isSaving} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${hasUnsavedChanges && !isSaving ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                {isSaving ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : <><Check size={20} />Save All Changes</>}
              </button>
            </div>
          </div>
        </div>

        {copiedText && <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">✓ Copied {copiedText}</div>}

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex items-center border-b">
            <div className="flex flex-1 overflow-x-auto">
              {Object.keys(endpoints).map((category) => (
                <div key={category} className="relative group">
                  <button onClick={() => setSelectedCategory(category)} className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${selectedCategory === category ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>
                    {category}<span className="ml-2 text-sm text-gray-500">({categoryPrefixes[category]})</span><span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">{endpoints[category]?.length || 0}</span>
                  </button>
                  {selectedCategory === category && <button onClick={() => handleDeleteCategory(category)} className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-all" title="Delete Category"><X size={14} /></button>}
                </div>
              ))}
            </div>
            <button onClick={() => setShowCategoryModal(true)} className="flex-shrink-0 mx-4 flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"><Plus size={18} />Add Category</button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">API Endpoints ({currentEndpoints.length})</h2>
              <button onClick={() => { setIsEditingCategory(true); setNewCategoryPrefix(prefix); }} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1 rounded-lg hover:border-gray-400 transition-colors"><Settings size={16} />Edit Prefix ({prefix})</button>
            </div>
            <button onClick={() => setIsAddingNew(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"><Plus size={20} />Add Endpoint</button>
          </div>

          {isEditingCategory && (
            <div className="mb-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Category Prefix:</label>
                <input type="text" value={newCategoryPrefix} onChange={(e) => setNewCategoryPrefix(e.target.value.toUpperCase())} placeholder="e.g., AUTH, USR, PRD" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32" maxLength={5} autoFocus />
                <button onClick={handleUpdateCategoryPrefix} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" title="Save"><Check size={20} /></button>
                <button onClick={() => { setIsEditingCategory(false); setNewCategoryPrefix(''); }} className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors" title="Cancel"><X size={20} /></button>
              </div>
            </div>
          )}

          {isAddingNew && (
            <div className="mb-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-600 w-20">{prefix}-{currentEndpoints.length + 1}</span>
                  <select value={newEndpoint.method} onChange={(e) => setNewEndpoint({ ...newEndpoint, method: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {HTTP_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
                  </select>
                  <input type="text" value={newEndpoint.endpoint} onChange={(e) => setNewEndpoint({ ...newEndpoint, endpoint: e.target.value })} placeholder="Endpoint (e.g., /api/users/:id)" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
                </div>
                <input type="text" value={newEndpoint.description} onChange={(e) => setNewEndpoint({ ...newEndpoint, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={newEndpoint.frontendUrl} onChange={(e) => setNewEndpoint({ ...newEndpoint, frontendUrl: e.target.value })} placeholder="Frontend URL (e.g., /profile/:id)" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" value={newEndpoint.backendPath} onChange={(e) => setNewEndpoint({ ...newEndpoint, backendPath: e.target.value })} placeholder="Backend Path (e.g., src/controllers/...)" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <textarea value={newEndpoint.requestBody} onChange={(e) => setNewEndpoint({ ...newEndpoint, requestBody: e.target.value })} placeholder="Request Body / Params" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={2} />
                  <textarea value={newEndpoint.responseBody} onChange={(e) => setNewEndpoint({ ...newEndpoint, responseBody: e.target.value })} placeholder="Response Body" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={2} />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={handleAddNew} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"><Check size={18} />Save</button>
                  <button onClick={() => { setNewEndpoint({ method: 'GET', endpoint: '', description: '', frontendUrl: '', backendPath: '', requestBody: '', responseBody: '' }); setIsAddingNew(false); }} className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center gap-2"><X size={18} />Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {currentEndpoints.map((ep, index) => (
              <div key={ep.id} draggable onDragStart={() => handleDragStart(index)} onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd} className={`border rounded-lg transition-all ${draggedItem === index ? 'opacity-50 border-blue-400' : 'hover:border-gray-300 border-gray-200'} ${!ep.isActive ? 'bg-gray-50' : 'bg-white'}`}>
                {editingId === ep.id ? (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-600 w-20">{prefix}-{ep.index}</span>
                      <select value={editData.method} onChange={(e) => setEditData({ ...editData, method: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {HTTP_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
                      </select>
                      <input type="text" value={editData.endpoint} onChange={(e) => setEditData({ ...editData, endpoint: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <input type="text" value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={editData.frontendUrl} onChange={(e) => setEditData({ ...editData, frontendUrl: e.target.value })} placeholder="Frontend URL" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="text" value={editData.backendPath} onChange={(e) => setEditData({ ...editData, backendPath: e.target.value })} placeholder="Backend Path" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <textarea value={editData.requestBody} onChange={(e) => setEditData({ ...editData, requestBody: e.target.value })} placeholder="Request Body / Params" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={2} />
                      <textarea value={editData.responseBody} onChange={(e) => setEditData({ ...editData, responseBody: e.target.value })} placeholder="Response Body" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={2} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleSaveEdit(ep.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"><Check size={18} />Save</button>
                      <button onClick={() => { setEditingId(null); setEditData({}); }} className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center gap-2"><X size={18} />Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-4">
                      <div className="flex-shrink-0 cursor-move text-gray-400 hover:text-gray-600"><GripVertical size={20} /></div>
                      <div className="flex-shrink-0 w-20"><span className="text-sm font-semibold text-gray-700">{prefix}-{ep.index}</span></div>
                      <div className={`flex-shrink-0 px-3 py-1 rounded border text-xs font-bold ${METHOD_COLORS[ep.method] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>{ep.method}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <code className={`text-sm font-mono ${!ep.isActive ? 'opacity-60' : ''}`}>{ep.endpoint}</code>
                          <button onClick={() => copyToClipboard(ep.endpoint, 'endpoint')} className="text-gray-400 hover:text-gray-600" title="Copy endpoint"><Copy size={14} /></button>
                        </div>
                        <p className={`text-sm text-gray-600 mt-1 ${!ep.isActive ? 'opacity-60' : ''}`}>{ep.description}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <button onClick={() => handleToggleActive(ep.id)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${ep.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>{ep.isActive ? 'Active' : 'Inactive'}</button>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => setExpandedEndpoint(expandedEndpoint === ep.id ? null : ep.id)} className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors" title="View Details"><ExternalLink size={18} /></button>
                        <button onClick={() => handleEdit(ep)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" title="Edit"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(ep.id)} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </div>
                    {expandedEndpoint === ep.id && (
                      <div className="px-4 pb-4 space-y-3 border-t bg-gray-50">
                        <div className="grid grid-cols-2 gap-4 pt-3">
                          <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase">Frontend URL</label>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-sm bg-white px-3 py-2 rounded border border-gray-200 flex-1">{ep.frontendUrl || 'Not specified'}</code>
                              {ep.frontendUrl && <button onClick={() => copyToClipboard(ep.frontendUrl, 'frontend URL')} className="text-gray-400 hover:text-gray-600"><Copy size={16} /></button>}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase">Backend Path</label>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-sm bg-white px-3 py-2 rounded border border-gray-200 flex-1 truncate">{ep.backendPath || 'Not specified'}</code>
                              {ep.backendPath && <button onClick={() => copyToClipboard(ep.backendPath, 'backend path')} className="text-gray-400 hover:text-gray-600"><Copy size={16} /></button>}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase">Request Body / Params</label>
                            <div className="flex items-start gap-2 mt-1">
                              <pre className="text-xs bg-white px-3 py-2 rounded border border-gray-200 flex-1 overflow-x-auto whitespace-pre-wrap">{ep.requestBody || 'No request body'}</pre>
                              {ep.requestBody && <button onClick={() => copyToClipboard(ep.requestBody, 'request body')} className="text-gray-400 hover:text-gray-600 mt-2"><Copy size={16} /></button>}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase">Response Body</label>
                            <div className="flex items-start gap-2 mt-1">
                              <pre className="text-xs bg-white px-3 py-2 rounded border border-gray-200 flex-1 overflow-x-auto whitespace-pre-wrap">{ep.responseBody || 'No response body'}</pre>
                              {ep.responseBody && <button onClick={() => copyToClipboard(ep.responseBody, 'response body')} className="text-gray-400 hover:text-gray-600 mt-2"><Copy size={16} /></button>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {currentEndpoints.length === 0 && <div className="text-center py-12 text-gray-500">No endpoints yet. Click "Add Endpoint" to create one.</div>}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Add Category:</strong> Create new API categories (e.g., Authentication, Users, Products)</li>
            <li>• <strong>Edit Prefix:</strong> Customize category prefixes for endpoint indexing</li>
            <li>• <strong>Add Endpoint:</strong> Document new API endpoints with method, path, and details</li>
            <li>• <strong>View Details:</strong> Click the external link icon to expand full endpoint documentation</li>
            <li>• <strong>Copy to Clipboard:</strong> Click copy icons to quickly copy endpoints, paths, or request/response bodies</li>
            <li>• <strong>Drag & Drop:</strong> Reorder endpoints within each category</li>
            <li>• <strong>Active/Inactive:</strong> Toggle endpoint status for deprecated or WIP APIs</li>
            <li>• <strong>Delete:</strong> Remove endpoints or entire categories</li>
          </ul>
        </div>

        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Category</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g., Authentication, Orders, Payments" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prefix (for endpoint indexing)</label>
                  <input type="text" value={newCategoryPrefix} onChange={(e) => setNewCategoryPrefix(e.target.value.toUpperCase())} placeholder="e.g., AUTH, ORD, PAY" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" maxLength={20} />
                  <p className="text-xs text-gray-500 mt-1">Endpoints will be indexed as {newCategoryPrefix || 'PREFIX'}-1, {newCategoryPrefix || 'PREFIX'}-2, etc.</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleAddCategory} disabled={!newCategoryName.trim() || !newCategoryPrefix.trim()} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">Create Category</button>
                <button onClick={() => { setShowCategoryModal(false); setNewCategoryName(''); setNewCategoryPrefix(''); }} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Confirm Deletion</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <div className="mb-6">
                {deleteModal.type === 'endpoint' && deleteModal.item && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">You are about to delete this endpoint:</p>
                    <div className="font-mono text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${METHOD_COLORS[deleteModal.item.method] || 'bg-gray-100 text-gray-700'}`}>{deleteModal.item.method}</span>
                      <span className="ml-2 font-semibold">{deleteModal.item.endpoint}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{deleteModal.item.description}</p>
                  </div>
                )}
                {deleteModal.type === 'category' && deleteModal.item && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">You are about to delete the category:</p>
                    <p className="font-medium text-gray-800 mb-3">{deleteModal.item} ({categoryPrefixes[deleteModal.item]})</p>
                    <p className="text-sm text-red-600 font-medium">⚠️ This will also delete all {endpoints[deleteModal.item]?.length || 0} endpoints in this category</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal({ isOpen: false, type: null, item: null })} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">Delete {deleteModal.type === 'category' ? 'Category' : 'Endpoint'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDocAdmin;