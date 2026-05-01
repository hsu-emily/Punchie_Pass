import { useState, useEffect } from 'react';
import { X, BookOpen, Search, Calendar, Trash2, Heart, Sparkles, MessageCircle } from 'lucide-react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from "@/services/firebase";
import { useAuth } from "@/features/auth/useAuth";

export default function JournalModal({ onClose }) {
  const { user } = useAuth();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJournal, setSelectedJournal] = useState(null);

  useEffect(() => {
    if (user) {
      loadJournals();
    }
  }, [user]);

  const loadJournals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'journals'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      const journalData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort on client side (newest first)
      journalData.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
      
      setJournals(journalData);
    } catch (error) {
      console.error('Error loading journals:', error);
      alert('Error loading journals: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (journalId) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) return;
    
    try {
      await deleteDoc(doc(db, 'journals', journalId));
      setJournals(journals.filter(j => j.id !== journalId));
      if (selectedJournal?.id === journalId) {
        setSelectedJournal(null);
      }
    } catch (error) {
      console.error('Error deleting journal:', error);
      alert('Failed to delete journal entry');
    }
  };

  const filteredJournals = journals.filter(journal => {
    const searchLower = searchTerm.toLowerCase();
    // Search in conversation messages
    return journal.conversation?.some(msg => 
      msg.content.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPreviewText = (journal) => {
    // Get first user message as preview
    const firstUserMsg = journal.conversation?.find(msg => msg.type === 'user');
    return firstUserMsg?.content || 'Conversation';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <BookOpen className="text-white" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white">My Reflection Journals</h2>
          <div className="flex-1 flex justify-end">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar - Journal List */}
          <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
            {/* Search */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="relative">
                <Search className="absolute left-1 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search journals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            {/* Journal List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-400">Loading journals...</div>
                </div>
              ) : filteredJournals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <BookOpen size={48} className="text-gray-300 mb-3" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No journals found' : 'No journal entries yet'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Start reflecting to create your first entry
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredJournals.map((journal) => (
                    <button
                      key={journal.id}
                      onClick={() => setSelectedJournal(journal)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedJournal?.id === journal.id
                          ? 'bg-pink-50 border-2 border-pink-300'
                          : 'bg-white border border-gray-200 hover:border-pink-200 hover:bg-pink-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-500">
                            {formatDate(journal.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {getPreviewText(journal)}
                      </p>
                      {journal.conversation && (
                        <div className="mt-2 flex items-center gap-1">
                          <MessageCircle size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {journal.conversation.length} message{journal.conversation.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Selected Journal Conversation */}
          <div className="flex-1 overflow-y-auto bg-white">
            {selectedJournal ? (
              <div className="p-8">
                {/* Journal Header */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                        <Heart className="text-pink-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">Reflection Conversation</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(selectedJournal.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(selectedJournal.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500 hover:text-red-600"
                      title="Delete this journal entry"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Conversation Messages */}
                <div className="space-y-4">
                  {selectedJournal.conversation?.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200'
                        }`}
                      >
                        {message.type === 'ai' && (
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="text-purple-600" size={18} />
                            <span className="text-sm font-bold text-purple-900">AI Coach</span>
                          </div>
                        )}
                        <p className={`leading-relaxed whitespace-pre-wrap ${
                          message.type === 'user' ? 'text-white' : 'text-gray-800'
                        }`}>
                          {message.content}
                        </p>
                        
                        {/* Show suggestions if present */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="text-purple-600" size={16} />
                              <span className="text-sm font-bold text-purple-900">Suggestions:</span>
                            </div>
                            {message.suggestions.map((suggestion, sIdx) => (
                              <div
                                key={sIdx}
                                className="bg-white border-2 border-purple-300 rounded-lg p-3"
                              >
                                <div className="flex items-start gap-2">
                                  <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white font-bold text-xs">
                                      {sIdx + 1}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">
                                    {suggestion}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <BookOpen size={64} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Select a journal entry to view</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Choose from the list on the left
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}