import React, { useState } from 'react';
import { Product, ProductCategory } from '../../types';
import { X, Save, Sparkles, Layers, Award } from 'lucide-react';

interface FormulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialProduct?: Product | null;
  seedData?: {
    fiber: number;
    rs: number;
    gi: number;
    tagline: string;
  } | null;
}

export const FormulationModal: React.FC<FormulationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  seedData
}) => {
  if (!isOpen) return null;

  // Form Fields
  const [name, setName] = useState(initialProduct?.name || 'Sindh Date & Flax Functional NutriBall');
  const [category, setCategory] = useState<ProductCategory>(initialProduct?.category || 'nutriballs');
  const [tagline, setTagline] = useState(
    initialProduct?.tagline || seedData?.tagline || 'High-amylose composite snack fortified with organic flax and chicory inulin'
  );
  const [description, setDescription] = useState(
    initialProduct?.description || 'Dense, cold-pressed functional snack calibrated for steady colonic fermentation and sustained morning satiety.'
  );
  const [servingSize, setServingSize] = useState(initialProduct?.servingSize || '2 balls (50g)');
  const [batchCode, setBatchCode] = useState(initialProduct?.batchCode || `NB-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [labStatus, setLabStatus] = useState<'Approved' | 'Formulation Testing' | 'Sensory Trial'>(
    initialProduct?.labStatus || 'Formulation Testing'
  );
  const [imageUrl, setImageUrl] = useState(initialProduct?.imageUrl || '/src/assets/images/nutribake_nutriballs_1789159111855.jpg');

  // Nutrition Facts
  const [calories, setCalories] = useState(initialProduct?.nutrition.calories || 175);
  const [proteinGrams, setProteinGrams] = useState(initialProduct?.nutrition.proteinGrams || 5.2);
  const [carbsGrams, setCarbsGrams] = useState(initialProduct?.nutrition.carbsGrams || 26);
  const [dietaryFiberGrams, setDietaryFiberGrams] = useState(
    initialProduct?.nutrition.dietaryFiberGrams || seedData?.fiber || 7.5
  );
  const [resistantStarchGrams, setResistantStarchGrams] = useState(
    initialProduct?.nutrition.resistantStarchGrams || seedData?.rs || 4.2
  );
  const [sugarsGrams, setSugarsGrams] = useState(initialProduct?.nutrition.sugarsGrams || 8);
  const [totalFatGrams, setTotalFatGrams] = useState(initialProduct?.nutrition.totalFatGrams || 6.5);
  const [saturatedFatGrams, setSaturatedFatGrams] = useState(initialProduct?.nutrition.saturatedFatGrams || 0.8);
  const [sodiumMg, setSodiumMg] = useState(initialProduct?.nutrition.sodiumMg || 45);
  const [glycemicIndexEst, setGlycemicIndexEst] = useState(
    initialProduct?.nutrition.glycemicIndexEst || seedData?.gi || 39
  );

  // Sensory Scores
  const [taste, setTaste] = useState(initialProduct?.sensoryScores.taste || 95);
  const [texture, setTexture] = useState(initialProduct?.sensoryScores.texture || 96);
  const [aroma, setAroma] = useState(initialProduct?.sensoryScores.aroma || 94);
  const [appearance, setAppearance] = useState(initialProduct?.sensoryScores.appearance || 95);
  const [panelNotes, setPanelNotes] = useState(
    initialProduct?.sensoryScores.panelNotes || 'Moist texture, clean crumb cohesion, pleasant natural sweetness.'
  );

  // Ingredients
  const [mainFunctionalIngredient, setMainFunctionalIngredient] = useState(
    initialProduct?.mainFunctionalIngredient || 'Green Banana Flour (Musa acuminata)'
  );
  const [allIngredientsText, setAllIngredientsText] = useState(
    initialProduct?.allIngredients.join(', ') || 'Green Banana Flour, Rolled Oats, Ground Flaxseed, Aseel Dates, Chicory Inulin, Raw Honey'
  );
  const [allergensText, setAllergensText] = useState(
    initialProduct?.allergens.join(', ') || 'Tree Nuts (Almonds)'
  );
  const [childFriendly, setChildFriendly] = useState(initialProduct?.childFriendly ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allIngredients = allIngredientsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const allergens = allergensText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const overallAcceptability = Number(((taste + texture + aroma + appearance) / 4).toFixed(1));

    const updatedProduct: Product = {
      id: initialProduct?.id || `prod-${Date.now()}`,
      name,
      category,
      tagline,
      description,
      whyThisProduct: initialProduct?.whyThisProduct || 'Engineered by University of Sindh food scientists to deliver therapeutic prebiotic fiber.',
      nutritionScore: Math.min(100, Math.round(70 + (dietaryFiberGrams * 2.5) + (resistantStarchGrams * 2))),
      nutrition: {
        calories: Number(calories),
        proteinGrams: Number(proteinGrams),
        carbsGrams: Number(carbsGrams),
        dietaryFiberGrams: Number(dietaryFiberGrams),
        resistantStarchGrams: Number(resistantStarchGrams),
        sugarsGrams: Number(sugarsGrams),
        totalFatGrams: Number(totalFatGrams),
        saturatedFatGrams: Number(saturatedFatGrams),
        sodiumMg: Number(sodiumMg),
        glycemicIndexEst: Number(glycemicIndexEst)
      },
      mainFunctionalIngredient,
      allIngredients,
      functionalIngredients: initialProduct?.functionalIngredients || [
        {
          name: mainFunctionalIngredient,
          role: 'Resistant Starch Matrix',
          scientificBenefit: 'Colonic fermentation stimulates Bifidobacterium and butyric acid.'
        }
      ],
      allergens,
      dietaryTags: ['High Fiber', 'Prebiotic RS2', 'Low Glycemic'],
      sensoryScores: {
        taste,
        texture,
        aroma,
        appearance,
        overallAcceptability,
        panelNotes
      },
      servingSize,
      portionSize: servingSize,
      shelfLife: initialProduct?.shelfLife || '14 days ambient, 45 days refrigerated',
      storageInstructions: initialProduct?.storageInstructions || 'Store in airtight glass container away from direct sunlight.',
      imageUrl,
      isFeatured: initialProduct?.isFeatured || false,
      childFriendly,
      batchCode,
      labStatus
    };

    onSave(updatedProduct);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#29211E]/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-[#FAF5ED] border border-[#3A2721] p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto my-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#3A2721]/10 pb-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-editorial font-bold text-[#657258] block">
              Formulation Monograph Builder
            </span>
            <h4 className="font-serif text-2xl sm:text-3xl text-[#3A2721] font-normal break-words">
              {initialProduct ? `Edit Formulation: ${initialProduct.name}` : 'Create New Functional Formulation'}
            </h4>
          </div>
          <button onClick={onClose} className="p-1 hover:text-[#A96345] shrink-0">
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
          {/* General Information */}
          <div className="space-y-4">
            <span className="text-[10.5px] uppercase tracking-editorial font-bold text-[#3A2721] block border-b border-[#3A2721]/10 pb-1">
              1. General Monograph Identity
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block uppercase text-[10px] font-bold text-[#3A2721] mb-1">
                  Formulation Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#3A2721]/20 font-sans text-xs"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] font-bold text-[#3A2721] mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2 bg-white border border-[#3A2721]/20 text-xs"
                >
                  <option value="cupcakes">Cupcakes & Muffins</option>
                  <option value="cookies">Biscuits & Cookies</option>
                  <option value="nutriballs">NutriBalls & Energy Bites</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block uppercase text-[10px] font-bold text-[#3A2721] mb-1">
                  Scientific Tagline / Key Claim
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#3A2721]/20 font-sans text-xs"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] font-bold text-[#3A2721] mb-1">
                  Batch Code
                </label>
                <input
                  type="text"
                  value={batchCode}
                  onChange={e => setBatchCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#3A2721]/20 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block uppercase text-[10px] font-bold text-[#3A2721] mb-1">
                  Serving Size / Portion
                </label>
                <input
                  type="text"
                  value={servingSize}
                  onChange={e => setServingSize(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#3A2721]/20 text-xs"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] font-bold text-[#3A2721] mb-1">
                  Clinical Lab Status
                </label>
                <select
                  value={labStatus}
                  onChange={e => setLabStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#3A2721]/20 text-xs"
                >
                  <option value="Approved">Approved Formulation</option>
                  <option value="Formulation Testing">Formulation Testing</option>
                  <option value="Sensory Trial">Sensory Trial</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="childFriendly"
                  checked={childFriendly}
                  onChange={e => setChildFriendly(e.target.checked)}
                  className="rounded border-[#3A2721]/30 text-[#3A2721] focus:ring-0"
                />
                <label htmlFor="childFriendly" className="uppercase text-[10px] font-bold text-[#3A2721] cursor-pointer">
                  Child & School Friendly
                </label>
              </div>
            </div>

            <div>
              <label className="block uppercase text-[10px] font-bold text-[#3A2721] mb-1">
                Clinical Monograph Summary
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#3A2721]/20 font-sans text-xs"
              />
            </div>
          </div>

          {/* Nutritional Profile */}
          <div className="space-y-4 pt-2">
            <span className="text-[10.5px] uppercase tracking-editorial font-bold text-[#3A2721] block border-b border-[#3A2721]/10 pb-1">
              2. Chemical & Nutritional Assay (Per Serving)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
              <div>
                <label className="text-[9.5px] uppercase text-[#29211E]/70 block">Calories</label>
                <input
                  type="number"
                  value={calories}
                  onChange={e => setCalories(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-[#3A2721]/20 text-xs"
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase text-[#657258] font-bold block">Total Fiber (g) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={dietaryFiberGrams}
                  onChange={e => setDietaryFiberGrams(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-[#657258] text-xs font-bold text-[#657258]"
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase text-[#A96345] font-bold block">RS2 Starch (g) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={resistantStarchGrams}
                  onChange={e => setResistantStarchGrams(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-[#A96345] text-xs font-bold text-[#A96345]"
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase text-[#29211E]/70 block">Protein (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={proteinGrams}
                  onChange={e => setProteinGrams(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-[#3A2721]/20 text-xs"
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase text-[#29211E]/70 block">Est. GI</label>
                <input
                  type="number"
                  value={glycemicIndexEst}
                  onChange={e => setGlycemicIndexEst(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-[#3A2721]/20 text-xs"
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase text-[#29211E]/70 block">Carbs (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={carbsGrams}
                  onChange={e => setCarbsGrams(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-[#3A2721]/20 text-xs"
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase text-[#29211E]/70 block">Sugars (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sugarsGrams}
                  onChange={e => setSugarsGrams(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-[#3A2721]/20 text-xs"
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase text-[#29211E]/70 block">Total Fat (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={totalFatGrams}
                  onChange={e => setTotalFatGrams(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-[#3A2721]/20 text-xs"
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase text-[#29211E]/70 block">Sat Fat (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={saturatedFatGrams}
                  onChange={e => setSaturatedFatGrams(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-[#3A2721]/20 text-xs"
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase text-[#29211E]/70 block">Sodium (mg)</label>
                <input
                  type="number"
                  value={sodiumMg}
                  onChange={e => setSodiumMg(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-[#3A2721]/20 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Sensory Targets */}
          <div className="space-y-4 pt-2">
            <span className="text-[10.5px] uppercase tracking-editorial font-bold text-[#3A2721] block border-b border-[#3A2721]/10 pb-1">
              3. Organoleptic Quality Targets (0-100%)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[9.5px] uppercase text-[#29211E]/70 block">Taste Target</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={taste}
                  onChange={e => setTaste(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-[#3A2721]/20 text-xs"
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase text-[#29211E]/70 block">Texture Target</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={texture}
                  onChange={e => setTexture(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-[#3A2721]/20 text-xs"
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase text-[#29211E]/70 block">Aroma Target</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={aroma}
                  onChange={e => setAroma(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-[#3A2721]/20 text-xs"
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase text-[#29211E]/70 block">Appearance</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={appearance}
                  onChange={e => setAppearance(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-[#3A2721]/20 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Ingredients & Allergens */}
          <div className="space-y-4 pt-2">
            <span className="text-[10.5px] uppercase tracking-editorial font-bold text-[#3A2721] block border-b border-[#3A2721]/10 pb-1">
              4. Ingredients & Allergen Declaration
            </span>

            <div>
              <label className="block uppercase text-[10px] font-bold text-[#3A2721] mb-1">
                Main Functional Ingredient (Botanical Key)
              </label>
              <input
                type="text"
                value={mainFunctionalIngredient}
                onChange={e => setMainFunctionalIngredient(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#3A2721]/20 text-xs"
              />
            </div>

            <div>
              <label className="block uppercase text-[10px] font-bold text-[#3A2721] mb-1">
                Full Ingredient Listing (Comma Separated)
              </label>
              <textarea
                rows={2}
                value={allIngredientsText}
                onChange={e => setAllIngredientsText(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#3A2721]/20 font-sans text-xs"
              />
            </div>

            <div>
              <label className="block uppercase text-[10px] font-bold text-[#3A2721] mb-1">
                Allergen Disclosures (Comma Separated, or 'None')
              </label>
              <input
                type="text"
                value={allergensText}
                onChange={e => setAllergensText(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#3A2721]/20 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 border-t border-[#3A2721]/10">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 border border-[#3A2721]/25 text-[#3A2721] uppercase tracking-editorial font-semibold text-[11px] text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#3A2721] hover:bg-[#2A1C18] text-[#FAF5ED] uppercase tracking-editorial font-semibold text-[11px] flex items-center justify-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{initialProduct ? 'Update Formulation' : 'Save & Publish Monograph'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
