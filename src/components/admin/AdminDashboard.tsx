import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory } from '../../types';
import { SensoryTrialsPanel } from './SensoryTrialsPanel';
import { ResistantStarchCalculator } from './ResistantStarchCalculator';
import { AdminSampleOrders } from './AdminSampleOrders';
import { FormulationModal } from './FormulationModal';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  FlaskConical, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  Save, 
  X, 
  CheckCircle2, 
  BarChart2, 
  Wheat, 
  Search, 
  Filter, 
  Printer, 
  Package, 
  Sparkles,
  Calculator,
  Award
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    sampleOrders, 
    sensoryTrials, 
    user, 
    setUser, 
    addToast 
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'formulations' | 'sensory-trials' | 'rs2-calculator' | 'sample-orders' | 'analytics'
  >('formulations');

  // Search & Filter in Formulations
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ProductCategory>('all');

  // Modal State for Create / Edit Formulation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [seedData, setSeedData] = useState<{
    fiber: number;
    rs: number;
    gi: number;
    tagline: string;
  } | null>(null);

  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mainFunctionalIngredient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.batchCode && p.batchCode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSaveFormulation = (prod: Product) => {
    const exists = products.some(p => p.id === prod.id);
    if (exists) {
      updateProduct(prod);
      addToast('Formulation Updated', `Successfully updated ${prod.name}`, 'success');
    } else {
      addProduct(prod);
      addToast('Formulation Created', `Published ${prod.name} monograph`, 'success');
    }
    setSeedData(null);
  };

  const handleDuplicateProduct = (original: Product) => {
    const cloned: Product = {
      ...original,
      id: `prod-clone-${Date.now()}`,
      name: `${original.name} (Iteration B)`,
      batchCode: `NB-2026-ITR${Math.floor(100 + Math.random() * 900)}`,
      labStatus: 'Formulation Testing'
    };
    addProduct(cloned);
    addToast('Formulation Duplicated', `Created prototype copy: ${cloned.name}`, 'info');
  };

  const handleSeedFromCalculator = (data: {
    fiber: number;
    rs: number;
    gi: number;
    tagline: string;
  }) => {
    setSeedData(data);
    setEditingProduct(null);
    setIsModalOpen(true);
    setActiveAdminTab('formulations');
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Admin Header Banner */}
      <div className="card-soft bg-white/90 p-6 sm:p-8 rounded-3xl border border-[#E8DDCF] flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_8px_30px_rgba(61,38,30,0.04)]">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="p-3.5 bg-[#FAF0E4] text-[#C97D36] rounded-2xl border border-[#E8DDCF] shrink-0 shadow-2xs">
            <FlaskConical className="w-7 h-7 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#3D261E] tracking-tight">
                NutriBake Laboratory Administration
              </h1>
              <span className="text-[10px] uppercase font-bold px-3 py-0.5 rounded-full border border-[#D4E0CD] bg-[#EEF3EB] text-[#5E7252]">
                Academic Lab
              </span>
            </div>
            <p className="text-xs text-[#2A1F1B]/75 mt-1">
              Dept. of Nutrition & Food Science • University of Sindh, Jamshoro • Formulation Monograph & Sensory Portal
            </p>
          </div>
        </div>

        {/* Quick Role Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#FAF0E4]/60 rounded-full border border-[#E8DDCF] text-xs shadow-2xs">
          <span className="px-2.5 text-xs font-bold text-[#3D261E]">Portal:</span>
          <button
            onClick={() => {
              setUser({
                id: 'admin-1',
                name: 'Chief Formulator (Admin)',
                email: 'admin@nutribake.edu',
                role: 'admin',
                savedProductIds: [],
                savedProducts: [],
                preferences: {
                  dailyFiberTargetGrams: 30,
                  dietaryGoal: 'Research Formulation & Quality Assurance',
                  allergens: []
                },
                dailyFiberGoalGrams: 30,
                currentFiberIntakeGrams: 20,
                recommendationHistoryCount: 12,
                memberSince: 'January 2025'
              });
              addToast('Admin Privileges Active', 'Full lab permissions enabled.', 'info');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              user?.role === 'admin'
                ? 'bg-[#3D261E] text-white shadow-xs'
                : 'text-[#2A1F1B]/70 hover:text-[#3D261E] hover:bg-white/80'
            }`}
          >
            Admin View
          </button>
          <button
            onClick={() => {
              setUser({
                id: 'u-1',
                name: 'Dr. Sarah Lin (Customer)',
                email: 'sarah.lin@example.com',
                role: 'user',
                savedProductIds: ['prod-cupcakes', 'prod-cookies'],
                savedProducts: ['prod-cupcakes', 'prod-cookies'],
                preferences: {
                  dailyFiberTargetGrams: 28,
                  dietaryGoal: 'High Fiber & Gut Vitality',
                  allergens: []
                },
                dailyFiberGoalGrams: 28,
                currentFiberIntakeGrams: 22,
                recommendationHistoryCount: 4,
                memberSince: 'March 2026'
              });
              addToast('Switched to User Mode', 'Viewing user portal perspective.', 'info');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              user?.role === 'user'
                ? 'bg-[#3D261E] text-white shadow-xs'
                : 'text-[#2A1F1B]/70 hover:text-[#3D261E] hover:bg-white/80'
            }`}
          >
            Customer View
          </button>
        </div>
      </div>

      {/* Sweet Pill Navigation Subtabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full border border-[#E8DDCF] shadow-2xs overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('formulations')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeAdminTab === 'formulations'
              ? 'bg-[#3D261E] text-white shadow-xs'
              : 'text-[#2A1F1B]/70 hover:text-[#3D261E] hover:bg-[#FAF0E4]/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Formulation Monographs ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('sensory-trials')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeAdminTab === 'sensory-trials'
              ? 'bg-[#3D261E] text-white shadow-xs'
              : 'text-[#2A1F1B]/70 hover:text-[#3D261E] hover:bg-[#FAF0E4]/60'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-[#C97D36]" />
          <span>Sensory Trials Lab ({sensoryTrials.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('rs2-calculator')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeAdminTab === 'rs2-calculator'
              ? 'bg-[#3D261E] text-white shadow-xs'
              : 'text-[#2A1F1B]/70 hover:text-[#3D261E] hover:bg-[#FAF0E4]/60'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-[#5E7252]" />
          <span>RS2 Formulation Engine</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('sample-orders')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeAdminTab === 'sample-orders'
              ? 'bg-[#3D261E] text-white shadow-xs'
              : 'text-[#2A1F1B]/70 hover:text-[#3D261E] hover:bg-[#FAF0E4]/60'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-[#C86B52]" />
          <span>Trial Dispatches ({sampleOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('analytics')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeAdminTab === 'analytics'
              ? 'bg-[#3D261E] text-white shadow-xs'
              : 'text-[#2A1F1B]/70 hover:text-[#3D261E] hover:bg-[#FAF0E4]/60'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 text-[#5E7252]" />
          <span>Laboratory Analytics</span>
        </button>
      </div>

      {/* TAB 1: FORMULATION MONOGRAPHS */}
      {activeAdminTab === 'formulations' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3A2721]/15 pb-4">
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#3A2721] font-normal tracking-snug-title">
                Active Formulation Catalog
              </h3>
              <p className="font-mono text-xs text-[#29211E]/70 mt-1">
                Calibrate nutritional assays, functional botanicals, and sensory parameters.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingProduct(null);
                setSeedData(null);
                setIsModalOpen(true);
              }}
              className="btn-sweet px-5 py-2.5 bg-[#3D261E] hover:bg-[#C97D36] text-[#FAF7F2] text-xs font-semibold rounded-full flex items-center gap-2 transition-all shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Formulation</span>
            </button>
          </div>

          {/* Search and Sweet Pill Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3D261E]/40" />
              <input
                type="text"
                placeholder="Search by recipe name, ingredient, or batch code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8DDCF] rounded-full text-xs text-[#2A1F1B] placeholder-[#2A1F1B]/40 focus:outline-none focus:border-[#C97D36] shadow-2xs transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#FAF0E4]/60 rounded-full border border-[#E8DDCF] shadow-2xs overflow-x-auto">
              {(['all', 'cupcakes', 'cookies', 'nutriballs'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                    categoryFilter === cat
                      ? 'bg-[#3D261E] text-white shadow-xs'
                      : 'text-[#2A1F1B]/70 hover:text-[#3D261E] hover:bg-white/80'
                  }`}
                >
                  {cat === 'all' ? 'All Treats' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Formulations Table in Soft Rounded Card */}
          <div className="card-soft border border-[#E8DDCF] rounded-3xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#E8DDCF] text-[#3D261E] font-bold text-[11px]">
                  <tr>
                    <th className="p-4 pl-6">Monograph & Recipe</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Fiber & RS2</th>
                    <th className="p-4">Sensory Score</th>
                    <th className="p-4">Batch Code</th>
                    <th className="p-4">Lab Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6DA] text-[#2A1F1B]">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <img 
                          src={p.imageUrl} 
                          alt={p.name} 
                          className="w-12 h-12 rounded-xl object-cover border border-[#E8DDCF] shrink-0 shadow-2xs" 
                        />
                        <div>
                          <span className="font-serif text-base text-[#3D261E] block font-medium">{p.name}</span>
                          <span className="text-[11px] text-[#2A1F1B]/60">
                            {p.servingSize} • {p.nutrition.calories} kcal
                          </span>
                        </div>
                      </td>

                      <td className="p-4 capitalize text-xs text-[#2A1F1B]/75 font-medium">
                        {p.category}
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-[#5E7252] block">+{p.nutrition.dietaryFiberGrams}g Fiber</span>
                        <span className="text-[11px] text-[#C97D36] font-semibold block">+{p.nutrition.resistantStarchGrams}g RS2</span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-[#3D261E] block">{p.sensoryScores.overallAcceptability}%</span>
                        <span className="text-[11px] text-[#2A1F1B]/60">Taste: {p.sensoryScores.taste}%</span>
                      </td>

                      <td className="p-4 text-xs font-mono text-[#2A1F1B]/75">
                        {p.batchCode || 'NB-LAB'}
                      </td>

                      <td className="p-4">
                        <span className={`inline-block text-[11px] font-semibold px-3 py-0.5 rounded-full border ${
                          p.labStatus === 'Approved'
                            ? 'bg-[#EEF3EB] border-[#D4E0CD] text-[#5E7252]'
                            : 'bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C]'
                        }`}>
                          {p.labStatus || 'Approved'}
                        </span>
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setSeedData(null);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-[#3A2721]/10 text-[#3A2721] transition-colors"
                            title="Edit Formulation"
                          >
                            <Edit3 className="w-4 h-4 stroke-[1.5]" />
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(p)}
                            className="p-1.5 hover:bg-[#3A2721]/10 text-[#3A2721] transition-colors"
                            title="Duplicate / Prototype Copy"
                          >
                            <Copy className="w-4 h-4 stroke-[1.5]" />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-700 transition-colors"
                            title="Delete Formulation"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.5]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SENSORY TRIALS LAB */}
      {activeAdminTab === 'sensory-trials' && (
        <SensoryTrialsPanel />
      )}

      {/* TAB 3: RS2 RESISTANT STARCH CALCULATOR */}
      {activeAdminTab === 'rs2-calculator' && (
        <ResistantStarchCalculator onApplyToNewFormulation={handleSeedFromCalculator} />
      )}

      {/* TAB 4: SAMPLE ORDERS FULFILLMENT */}
      {activeAdminTab === 'sample-orders' && (
        <AdminSampleOrders />
      )}

      {/* TAB 5: ANALYTICS & RESEARCH REPORT */}
      {activeAdminTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-[#FAF5ED] border border-[#3A2721]/15">
              <span className="font-mono text-[10px] font-bold uppercase tracking-editorial text-[#29211D]/60 block">
                Total Formulations
              </span>
              <span className="text-3xl font-serif text-[#3A2721] mt-1 block">{products.length}</span>
              <span className="font-mono text-[10.5px] text-[#657258] font-bold">100% Validated Assays</span>
            </div>

            <div className="p-5 bg-[#FAF5ED] border border-[#3A2721]/15">
              <span className="font-mono text-[10px] font-bold uppercase tracking-editorial text-[#29211D]/60 block">
                Avg Dietary Fiber
              </span>
              <span className="text-3xl font-serif text-[#657258] mt-1 block">
                {(products.reduce((acc, p) => acc + p.nutrition.dietaryFiberGrams, 0) / products.length).toFixed(1)}g
              </span>
              <span className="font-mono text-[10.5px] text-[#29211D]/60">Per standard serving</span>
            </div>

            <div className="p-5 bg-[#FAF5ED] border border-[#3A2721]/15">
              <span className="font-mono text-[10px] font-bold uppercase tracking-editorial text-[#29211D]/60 block">
                Sensory Trials Logged
              </span>
              <span className="text-3xl font-serif text-[#A96345] mt-1 block">{sensoryTrials.length}</span>
              <span className="font-mono text-[10.5px] text-[#29211D]/60">Trained Panelists</span>
            </div>

            <div className="p-5 bg-[#FAF5ED] border border-[#3A2721]/15">
              <span className="font-mono text-[10px] font-bold uppercase tracking-editorial text-[#29211D]/60 block">
                Trial Dispatches Active
              </span>
              <span className="text-3xl font-serif text-[#3A2721] mt-1 block">{sampleOrders.length}</span>
              <span className="font-mono text-[10.5px] text-[#657258] font-bold">Chilled Logistics Flow</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-[#FAF5ED] border border-[#3A2721]/15 space-y-4">
            <div className="flex justify-between items-center border-b border-[#3A2721]/10 pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-editorial font-bold text-[#657258] block">
                  Scientific Monograph
                </span>
                <h4 className="font-serif text-2xl font-normal text-[#3A2721]">
                  University of Sindh Clinical Research Digest
                </h4>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white border border-[#3A2721]/20 font-mono text-xs uppercase tracking-editorial font-semibold flex items-center gap-2 hover:bg-[#FAF5ED]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Monograph</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              <div className="p-4 bg-white border border-[#3A2721]/10 space-y-2">
                <span className="font-bold uppercase tracking-editorial text-[10.5px] text-[#3A2721] block">
                  Resistant Starch Type-2 (RS2) Retention
                </span>
                <p className="text-[#29211E]/80 leading-relaxed font-sans text-xs">
                  Native B-type crystalline granules in green banana flour withstand mild convective baking below 165°C. In vitro amylase digestion tests demonstrate 74.2% resistance to salivary and pancreatic hydrolysis.
                </p>
              </div>

              <div className="p-4 bg-white border border-[#3A2721]/10 space-y-2">
                <span className="font-bold uppercase tracking-editorial text-[10.5px] text-[#657258] block">
                  Microbiome SCFA & Satiety Metrics
                </span>
                <p className="text-[#29211E]/80 leading-relaxed font-sans text-xs">
                  Synergy between green banana amylose and chicory inulin yields significantly elevated butyrate concentrations, promoting healthy GLP-1 secretion and sustained fullness without postprandial glycemic spikes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulation Modal */}
      <FormulationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
          setSeedData(null);
        }}
        onSave={handleSaveFormulation}
        initialProduct={editingProduct}
        seedData={seedData}
      />
    </div>
  );
};
