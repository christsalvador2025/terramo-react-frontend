import React, { useState } from 'react';
import { Trash2, Edit2, Plus, GripVertical, Check, X, Settings } from 'lucide-react';

// Mock data structure
const initialQuestionsData = {
  Environment: [
    { id: 'e1', index: 1, question: 'Contribute to climate protection', isActive: true },
    { id: 'e2', index: 2, question: 'Adaptation to climate change: scenario analyses and emergency plans', isActive: true },
    { id: 'e3', index: 3, question: 'Save energy or use it efficiently', isActive: true },
    { id: 'e4', index: 4, question: 'Reduce emissions from fossil fuels and propellants', isActive: false },
    { id: 'e5', index: 5, question: 'Reduce pollution of soil, air, water', isActive: true },
  ],
  Social: [
    { id: 's1', index: 1, question: 'Ensure fair working conditions', isActive: true },
    { id: 's2', index: 2, question: 'Promote diversity and inclusion', isActive: true },
    { id: 's3', index: 3, question: 'Occupational health and safety', isActive: true },
  ],
  'Corporate Governance': [
    { id: 'cg1', index: 1, question: 'Business ethics and compliance', isActive: true },
    { id: 'cg2', index: 2, question: 'Transparency in reporting', isActive: true },
    { id: 'cg3', index: 3, question: 'Risk management', isActive: false },
  ],
};

const initialCategoryPrefixes = {
  Environment: 'E',
  Social: 'S',
  'Corporate Governance': 'CG',
};

interface Question {
  id: string;
  index: number;
  question: string;
  isActive: boolean;
}

const QuestionnaireAdmin = () => {
  const [selectedCategory, setSelectedCategory] = useState('Environment');
  const [questions, setQuestions] = useState(initialQuestionsData);
  const [categoryPrefixes, setCategoryPrefixes] = useState(initialCategoryPrefixes);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryPrefix, setNewCategoryPrefix] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'category' | 'question' | null;
    item: any;
  }>({
    isOpen: false,
    type: null,
    item: null,
  });

  const currentQuestions = questions[selectedCategory] || [];
  const prefix = categoryPrefixes[selectedCategory] || '';

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newQuestions = [...currentQuestions];
    const draggedQuestion = newQuestions[draggedItem];
    newQuestions.splice(draggedItem, 1);
    newQuestions.splice(index, 0, draggedQuestion);

    const reindexed = newQuestions.map((q, idx) => ({
      ...q,
      index: idx + 1,
    }));

    setQuestions({
      ...questions,
      [selectedCategory]: reindexed,
    });
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setHasUnsavedChanges(true);
  };

  const handleDelete = (id: string) => {
    setHasUnsavedChanges(true);
    const questionToDelete = currentQuestions.find(q => q.id === id);
    setDeleteModal({
      isOpen: true,
      type: 'question',
      item: questionToDelete,
    });
  };

  const confirmDelete = () => {
    if (deleteModal.type === 'question' && deleteModal.item) {
      const filtered = currentQuestions.filter((q) => q.id !== deleteModal.item.id);
      const reindexed = filtered.map((q, idx) => ({
        ...q,
        index: idx + 1,
      }));
      setQuestions({
        ...questions,
        [selectedCategory]: reindexed,
      });
    } else if (deleteModal.type === 'category' && deleteModal.item) {
      const newQuestions = { ...questions };
      delete newQuestions[deleteModal.item];
      
      const newPrefixes = { ...categoryPrefixes };
      delete newPrefixes[deleteModal.item];
      
      setQuestions(newQuestions);
      setCategoryPrefixes(newPrefixes);
      
      if (selectedCategory === deleteModal.item) {
        setSelectedCategory(Object.keys(newQuestions)[0]);
      }
    }
    
    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      type: null,
      item: null,
    });
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setEditText(question.question);
  };

  const handleSaveEdit = (id: string) => {
    setHasUnsavedChanges(true);
    const updated = currentQuestions.map((q) =>
      q.id === id ? { ...q, question: editText } : q
    );
    setQuestions({
      ...questions,
      [selectedCategory]: updated,
    });
    setEditingId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleToggleActive = (id: string) => {
    setHasUnsavedChanges(true);
    const updated = currentQuestions.map((q) =>
      q.id === id ? { ...q, isActive: !q.isActive } : q
    );
    setQuestions({
      ...questions,
      [selectedCategory]: updated,
    });
  };

  const handleAddNew = () => {
    if (!newQuestionText.trim()) return;

    setHasUnsavedChanges(true);
    const newQuestion: Question = {
      id: `${prefix.toLowerCase()}${Date.now()}`,
      index: currentQuestions.length + 1,
      question: newQuestionText,
      isActive: true,
    };

    setQuestions({
      ...questions,
      [selectedCategory]: [...currentQuestions, newQuestion],
    });
    setNewQuestionText('');
    setIsAddingNew(false);
  };

  const handleCancelAdd = () => {
    setNewQuestionText('');
    setIsAddingNew(false);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !newCategoryPrefix.trim()) return;
    
    setHasUnsavedChanges(true);
    setQuestions({
      ...questions,
      [newCategoryName]: [],
    });
    
    setCategoryPrefixes({
      ...categoryPrefixes,
      [newCategoryName]: newCategoryPrefix.toUpperCase(),
    });
    
    setSelectedCategory(newCategoryName);
    setNewCategoryName('');
    setNewCategoryPrefix('');
    setShowCategoryModal(false);
  };

  const handleUpdateCategoryPrefix = () => {
    if (!newCategoryPrefix.trim()) return;
    
    setHasUnsavedChanges(true);
    setCategoryPrefixes({
      ...categoryPrefixes,
      [selectedCategory]: newCategoryPrefix.toUpperCase(),
    });
    
    setNewCategoryPrefix('');
    setIsEditingCategory(false);
  };

  const handleDeleteCategory = (categoryName: string) => {
    if (Object.keys(questions).length <= 1) {
      alert('Cannot delete the last category');
      return;
    }
    
    setHasUnsavedChanges(true);
    setDeleteModal({
      isOpen: true,
      type: 'category',
      item: categoryName,
    });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    
    try {
      const payload = {
        categories: Object.keys(questions).map(categoryName => ({
          name: categoryName,
          prefix: categoryPrefixes[categoryName],
          questions: questions[categoryName].map(q => ({
            id: q.id,
            index: q.index,
            question: q.question,
            isActive: q.isActive,
            category: categoryName,
          }))
        }))
      };

      console.log('Saving payload:', JSON.stringify(payload, null, 2));

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasUnsavedChanges(false);
      alert('All changes saved successfully!');
      
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                ESG Questionnaire Admin
              </h1>
              <p className="text-gray-600">
                Manage questions, reorder with drag & drop, and set active status
              </p>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <span className="text-sm text-orange-600 font-medium">
                  • Unsaved changes
                </span>
              )}
              <button
                onClick={handleSaveAll}
                disabled={!hasUnsavedChanges || isSaving}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  hasUnsavedChanges && !isSaving
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Save All Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex items-center border-b">
            <div className="flex flex-1 overflow-x-auto">
              {Object.keys(questions).map((category) => (
                <div key={category} className="relative group">
                  <button
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === category
                        ? 'border-b-2 border-teal-600 text-teal-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {category}
                    <span className="ml-2 text-sm text-gray-500">
                      ({categoryPrefixes[category]})
                    </span>
                  </button>
                  {selectedCategory === category && (
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-all"
                      title="Delete Category"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex-shrink-0 mx-4 flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus size={18} />
              Add Category
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Questions ({currentQuestions.length})
              </h2>
              <button
                onClick={() => {
                  setIsEditingCategory(true);
                  setNewCategoryPrefix(prefix);
                }}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1 rounded-lg hover:border-gray-400 transition-colors"
              >
                <Settings size={16} />
                Edit Prefix ({prefix})
              </button>
            </div>
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus size={20} />
              Add Question to {selectedCategory}
            </button>
          </div>

          {isEditingCategory && (
            <div className="mb-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Category Prefix:
                </label>
                <input
                  type="text"
                  value={newCategoryPrefix}
                  onChange={(e) => setNewCategoryPrefix(e.target.value.toUpperCase())}
                  placeholder="e.g., E, S, CG"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                  maxLength={5}
                  autoFocus
                />
                <button
                  onClick={handleUpdateCategoryPrefix}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Save"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={() => {
                    setIsEditingCategory(false);
                    setNewCategoryPrefix('');
                  }}
                  className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                  title="Cancel"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {isAddingNew && (
            <div className="mb-4 p-4 border-2 border-teal-200 rounded-lg bg-teal-50">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-16 pt-2">
                  <span className="text-sm font-semibold text-gray-600">
                    {prefix}-{currentQuestions.length + 1}
                  </span>
                </div>
                <input
                  type="text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Enter new question..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddNew}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    title="Save"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={handleCancelAdd}
                    className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                    title="Cancel"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {currentQuestions.map((q, index) => (
              <div
                key={q.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-4 border rounded-lg transition-all ${
                  draggedItem === index
                    ? 'opacity-50 border-teal-400'
                    : 'hover:border-gray-300 border-gray-200'
                } ${!q.isActive ? 'bg-gray-50' : 'bg-white'}`}
              >
                <div className="flex-shrink-0 cursor-move text-gray-400 hover:text-gray-600">
                  <GripVertical size={20} />
                </div>

                <div className="flex-shrink-0 w-16">
                  <span className="text-sm font-semibold text-gray-700">
                    {prefix}-{q.index}
                  </span>
                </div>

                <div className="flex-1">
                  {editingId === q.id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      autoFocus
                    />
                  ) : (
                    <p className={`text-gray-800 ${!q.isActive ? 'opacity-60' : ''}`}>
                      {q.question}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(q.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      q.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {q.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {editingId === q.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(q.id)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Save"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                        title="Cancel"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(q)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {currentQuestions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No questions yet. Click "Add Question to {selectedCategory}" to create one.
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Add Category:</strong> Create new categories with custom prefixes</li>
            <li>• <strong>Edit Prefix:</strong> Click "Edit Prefix" button to change the category prefix</li>
            <li>• <strong>Add Question:</strong> Questions are automatically added to the active category</li>
            <li>• <strong>Drag & Drop:</strong> Reorder questions within each category</li>
            <li>• <strong>Active/Inactive:</strong> Toggle question status with one click</li>
            <li>• <strong>Delete:</strong> Remove questions or entire categories (hover on tab to see delete button)</li>
          </ul>
        </div>

        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Add New Category
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Technology, Innovation"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prefix (for question indexing)
                  </label>
                  <input
                    type="text"
                    value={newCategoryPrefix}
                    onChange={(e) => setNewCategoryPrefix(e.target.value.toUpperCase())}
                    placeholder="e.g., T, INN"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    maxLength={5}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Questions will be indexed as {newCategoryPrefix || 'PREFIX'}-1, {newCategoryPrefix || 'PREFIX'}-2, etc.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim() || !newCategoryPrefix.trim()}
                  className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Create Category
                </button>
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewCategoryName('');
                    setNewCategoryPrefix('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
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
                  <h3 className="text-xl font-semibold text-gray-800">
                    Confirm Deletion
                  </h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                {deleteModal.type === 'question' && deleteModal.item && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      You are about to delete this question:
                    </p>
                    <p className="font-medium text-gray-800">
                      {prefix}-{deleteModal.item.index}: {deleteModal.item.question}
                    </p>
                  </div>
                )}
                
                {deleteModal.type === 'category' && deleteModal.item && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      You are about to delete the category:
                    </p>
                    <p className="font-medium text-gray-800 mb-3">
                      {deleteModal.item} ({categoryPrefixes[deleteModal.item]})
                    </p>
                    <p className="text-sm text-red-600 font-medium">
                      ⚠️ This will also delete all {questions[deleteModal.item]?.length || 0} questions in this category
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete {deleteModal.type === 'category' ? 'Category' : 'Question'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionnaireAdmin;