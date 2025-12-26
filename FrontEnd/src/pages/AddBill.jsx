import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../api/base";
import * as XLSX from "xlsx";

const AddBill = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editBillId = location.state?.billId;
  const isReadOnly = location.state?.readOnly || false;
  const autoAddStarter = location.state?.autoAddStarter;
  const autoAddRating = location.state?.autoAddRating;

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [allBundles, setAllBundles] = useState([]);
  const [billBundles, setBillBundles] = useState([]);
  const [allComponents, setAllComponents] = useState([]);
  const [expandedBundleIds, setExpandedBundleIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [starterFilter, setStarterFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [billDiscountPercent, setBillDiscountPercent] = useState(0);
  const [componentSearch, setComponentSearch] = useState("");
  const [activeBundleId, setActiveBundleId] = useState(null);

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  /* ---------------- HELPERS ---------------- */

  const recalcBundle = useCallback((bundle) => {
    const components = bundle.components.map((c) => {
      const disc = Number(c.discount_percent || 0);
      const discountedPrice = Number(c.base_price) * (1 - disc / 100);
      return { ...c, unit_price: discountedPrice };
    });
    const subtotal = components.reduce((sum, c) => {
      const qty = c.quantity === "" ? 0 : Number(c.quantity);
      return sum + qty * Number(c.unit_price || 0);
    }, 0);
    return { ...bundle, components, subtotal, totalAfterDiscount: subtotal };
  }, []);

  const billSubtotal = useMemo(() => billBundles.reduce((s, b) => s + b.totalAfterDiscount, 0), [billBundles]);
  const billDiscountAmount = Math.max(0, billSubtotal * (Number(billDiscountPercent) || 0)) / 100;
  const grandTotal = Math.max(billSubtotal - billDiscountAmount, 0);

  const toggleBundle = (bundleId) => {
    setExpandedBundleIds((prev) =>
      prev.includes(bundleId) ? prev.filter((id) => id !== bundleId) : [...prev, bundleId]
    );
  };

  const handleAddBundleInternal = useCallback((starter, rating, bundlesList) => {
    const prod = bundlesList.find(p => p.starter_type === starter && Number(p.rating_kw) === Number(rating));
    if (!prod) return;

    const components = prod.components.map((c) => ({
      name: c.name,
      brand_name: c.brand_name,
      model: c.model || "",
      quantity: Math.max(1, Number(c.quantity)),
      base_price: Number(c.unit_price),
      unit_price: Number(c.unit_price),
      discount_percent: 0,
    }));

    const newId = `${prod.id}-${Date.now()}`;
    const newBundle = recalcBundle({
      localId: newId,
      productId: prod.id,
      starterType: prod.starter_type,
      ratingKw: prod.rating_kw,
      components,
      totalAfterDiscount: 0,
    });

    setBillBundles(prev => [...prev, newBundle]);
    setExpandedBundleIds(prev => [...prev, newId]);
  }, [recalcBundle]);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    if (!token) return navigate("/login");
    if (role !== "admin" && role !== "user") return navigate("/unauthorized");

    const fetchData = async () => {
      try {
        const [prodRes, compRes] = await Promise.all([
          axios.get(`${API_URL}/products`, { headers: authHeaders }),
          axios.get(`${API_URL}/components`, { headers: authHeaders }),
        ]);
        
        const products = prodRes.data || [];
        setAllBundles(products);
        setAllComponents(compRes.data || []);

        if (editBillId) {
          const billRes = await axios.get(`${API_URL}/billing/${editBillId}`, { headers: authHeaders });
          const billData = billRes.data;

          const loadedBundles = billData.items.map((item, idx) => {
            const originalProduct = products.find(p => p.id === item.product_id);
            return {
              localId: `old-${idx}`,
              productId: item.product_id,
              starterType: item.product_name.split(" ")[0],
              ratingKw: item.product_name.split(" ")[1],
              components: originalProduct ? originalProduct.components.map(c => ({
                name: c.name,
                brand_name: c.brand_name,
                model: c.model || "",
                quantity: c.quantity,
                base_price: c.unit_price,
                unit_price: c.unit_price,
                discount_percent: 0,
              })) : [{
                name: item.product_name,
                brand_name: "",
                model: "",
                quantity: item.quantity,
                base_price: item.unit_price,
                unit_price: item.unit_price,
                discount_percent: 0,
              }],
              subtotal: item.line_total,
              totalAfterDiscount: item.line_total,
            };
          });

          setBillBundles(loadedBundles);
          const discPercent = (billData.discount_amount / billData.subtotal_amount) * 100;
          setBillDiscountPercent(Math.round(discPercent) || 0);
        } else if (autoAddStarter && autoAddRating) {
          // If navigated from home page with starter info
          handleAddBundleInternal(autoAddStarter, autoAddRating, products);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, token, role, authHeaders, editBillId, autoAddStarter, autoAddRating, handleAddBundleInternal]);

  /* ---------------- HANDLERS ---------------- */

  const handleAddBundle = () => {
    handleAddBundleInternal(starterFilter, ratingFilter, allBundles);
  };

  const removeBundle = (id) => {
    if (isReadOnly) return;
    setBillBundles(prev => prev.filter(b => b.localId !== id));
    setExpandedBundleIds(prev => prev.filter(eid => eid !== id));
  };

  const updateQuantity = (bundleId, idx, value) => {
    if (isReadOnly) return;
    const numValue = value === "" ? "" : Math.max(1, parseInt(value));
    setBillBundles(prev => prev.map(b => {
      if (b.localId !== bundleId) return b;
      const components = [...b.components];
      components[idx].quantity = numValue;
      return recalcBundle({ ...b, components });
    }));
  };

  const handleQuantityBlur = (bundleId, idx, value) => {
    if (isReadOnly) return;
    if (value === "" || parseInt(value) < 1) {
      updateQuantity(bundleId, idx, "1");
    }
  };

  const updateComponentDiscount = (bundleId, idx, value) => {
    if (isReadOnly) return;
    const numValue = value === "" ? 0 : Math.min(100, Math.max(0, Number(value)));
    setBillBundles((prev) =>
      prev.map((b) => {
        if (b.localId !== bundleId) return b;
        const components = [...b.components];
        components[idx].discount_percent = numValue;
        return recalcBundle({ ...b, components });
      })
    );
  };

  const addComponentToBundle = (bundleId, component) => {
    if (isReadOnly) return;
    setBillBundles((prev) =>
      prev.map((b) => {
        if (b.localId !== bundleId) return b;
        const newComp = {
          name: component.name,
          brand_name: component.brand_name,
          model: component.model || "",
          quantity: 1,
          base_price: Number(component.base_unit_price || 0),
          unit_price: Number(component.base_unit_price || 0),
          discount_percent: 0,
        };
        return recalcBundle({ ...b, components: [...b.components, newComp] });
      })
    );
    setComponentSearch("");
    setActiveBundleId(null);
  };

  const removeComponent = (bundleId, idx) => {
    if (isReadOnly) return;
    setBillBundles((prev) =>
      prev.map((b) => {
        if (b.localId !== bundleId) return b;
        return recalcBundle({
          ...b,
          components: b.components.filter((_, i) => i !== idx),
        });
      })
    );
  };

  const filteredComponents = useMemo(() => {
    if (componentSearch.length < 3) return [];
    const query = componentSearch.toLowerCase();
    return allComponents.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.brand_name && c.brand_name.toLowerCase().includes(query)) ||
        (c.model && c.model.toLowerCase().includes(query))
    );
  }, [componentSearch, allComponents]);

  const generateExcel = (billNumber) => {
    const rows = [["BILL ID:", billNumber], []];
    billBundles.forEach((bundle) => {
      rows.push([`${bundle.starterType} ${bundle.ratingKw} kW`]);
      rows.push(["PRODUCT", "MODEL", "BRAND", "QTY", "RATE (Disc.)", "TOTAL"]);
      bundle.components.forEach((c) => {
        rows.push([
          c.name,
          c.model || "",
          c.brand_name,
          c.quantity,
          c.unit_price,
          c.quantity * c.unit_price,
        ]);
      });
      rows.push(["", "", "", "", "TOTAL", bundle.subtotal], []);
    });
    rows.push(
      [],
      ["SUBTOTAL", billSubtotal],
      ["BILL DISCOUNT (%)", `${billDiscountPercent}%`],
      ["GRAND TOTAL", grandTotal]
    );
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bill");
    XLSX.writeFile(workbook, `Bill_${billNumber}.xlsx`);
  };

  const handleCreateBill = async () => {
    if (billBundles.length === 0 || isReadOnly) return;
    try {
      const items = billBundles.map((b) => ({
        product_id: b.productId,
        quantity: 1,
        override_price: b.totalAfterDiscount,
      }));
      const res = await axios.post(
        `${API_URL}/billing`,
        { items, discount_amount: billDiscountAmount },
        { headers: authHeaders }
      );
      generateExcel(res.data.bill_number);
      navigate("/view-bills");
    } catch (err) {
      alert("Failed to generate order");
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="animate-pulse">Initializing Data...</div>
      </div>
    );

  return (
    <div className="home-wrapper">
      <div className="max-w-6xl mx-auto px-4 md:px-10">
        <h1 className="text-3xl md:text-5xl font-black mb-8 text-center bg-linear-to-r from-white to-gray-500 bg-clip-text text-transparent">
          {isReadOnly ? "Order Summary (Read-Only)" : editBillId ? "View Order Details" : "Create New Order"}
        </h1>

        {!editBillId && !isReadOnly && (
          <div className="home-card max-w-none! mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <label className="filter-label">Starter Type</label>
                <select 
                  value={starterFilter} 
                  onChange={(e) => {setStarterFilter(e.target.value); setRatingFilter("");}} 
                  className="filter-select"
                >
                  <option value="">Select Type</option>
                  <option>DOL</option><option>RDOL</option><option>S/D</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="filter-label">Rating</label>
                <select 
                  value={ratingFilter} 
                  onChange={(e) => setRatingFilter(e.target.value)} 
                  className="filter-select"
                >
                  <option value="">Select Rating</option>
                  {allBundles.filter(b => b.starter_type === starterFilter).map(b => (
                    <option key={b.id} value={b.rating_kw} className="bg-[#1a1a1a]">{b.rating_kw} kW</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={handleAddBundle} className="primary-action-btn w-full mt-0! py-3! cursor-pointer">
                   + Add Starter Type
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {billBundles.map((b) => {
            const isExpanded = expandedBundleIds.includes(b.localId);
            return (
              <div key={b.localId} className="bg-[#0a0a0a]/60 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
                <div 
                  onClick={() => toggleBundle(b.localId)} 
                  className="p-4 sm:p-5 flex flex-wrap justify-between items-center gap-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`transition-transform duration-200 text-green-500 text-xs ${isExpanded ? "rotate-90" : "rotate-0"}`}>▶</span>
                    <span className="font-black text-lg sm:text-xl text-green-400 uppercase tracking-tight">
                      {b.starterType} — {b.ratingKw} kW
                    </span>
                    {!editBillId && !isReadOnly && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBundle(b.localId);
                        }}
                        className="text-gray-500 hover:text-red-500 ml-2 cursor-pointer hover:border hover:bg-red-500/25 border rounded-full border-transparent hover:border-red-500/50 p-1.5 transition-all"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] text-gray-500 uppercase font-bold">Starter Subtotal</p>
                     <p className="font-mono font-bold text-lg">₹{b.subtotal.toFixed(2)}</p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-3 sm:p-6 space-y-3 bg-black/30">
                    {b.components.map((c, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 gap-4">
                        <div className="flex-1">
                          <p className="font-bold text-sm sm:text-base">{c.name}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">{c.brand_name} {c.model ? `| ${c.model}` : ""}</p>
                        </div>

                        <div className="grid grid-cols-3 sm:flex sm:items-center gap-4 w-full sm:w-auto">
                          <div className="flex flex-col gap-1">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Rate</p>
                            <p className="font-mono text-xs sm:text-sm">₹{Number(c.unit_price || 0).toFixed(0)}</p>
                            {c.discount_percent > 0 && (
                                <p className="text-[9px] text-green-500 line-through">₹{c.base_price}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold">Qty</label>
                            <input 
                              type="number" 
                              disabled={!!editBillId || isReadOnly} 
                              value={c.quantity} 
                              onFocus={(e) => e.target.select()}
                              onBlur={(e) => handleQuantityBlur(b.localId, idx, e.target.value)}
                              onClick={(e) => e.stopPropagation()} 
                              onChange={(e) => updateQuantity(b.localId, idx, e.target.value)} 
                              className="w-full sm:w-14 bg-black/40 border border-white/10 p-1.5 rounded-lg text-center outline-none focus:border-green-500 text-sm disabled:opacity-50" 
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold">Disc%</label>
                            <input type="number" disabled={!!editBillId || isReadOnly} value={c.discount_percent} onClick={(e) => e.stopPropagation()} onChange={(e) => updateComponentDiscount(b.localId, idx, e.target.value)} className="w-full sm:w-14 bg-black/40 border border-green-900/40 p-1.5 rounded-lg text-center outline-none focus:border-green-500 text-sm text-green-400 font-bold disabled:opacity-50" />
                          </div>
                          {!editBillId && !isReadOnly && (
                            <button onClick={(e) => { e.stopPropagation(); removeComponent(b.localId, idx); }} className="hidden sm:block text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-full transition-all">✕</button>
                          )}
                        </div>
                        {!editBillId && !isReadOnly && (
                          <button onClick={(e) => { e.stopPropagation(); removeComponent(b.localId, idx); }} className="sm:hidden w-full text-xs text-red-500 py-2 border-t border-white/5 mt-2">Remove Component</button>
                        )}
                      </div>
                    ))}

                    {!editBillId && !isReadOnly && (
                      <div className="mt-4 border-t border-white/5 pt-4">
                        {activeBundleId === b.localId ? (
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Start typing component name (3+ chars)..." 
                                className="flex-1 bg-black/60 border border-white/20 p-3 rounded-xl outline-none text-sm focus:border-green-500" 
                                value={componentSearch} 
                                onChange={(e) => setComponentSearch(e.target.value)} 
                                autoFocus 
                              />
                              <button onClick={() => { setActiveBundleId(null); setComponentSearch(""); }} className="text-xs text-gray-500 hover:text-white px-2">Cancel</button>
                            </div>
                            {filteredComponents.length > 0 && (
                              <div className="max-h-60 overflow-y-auto bg-black border border-white/20 rounded-xl shadow-2xl">
                                {filteredComponents.map((comp) => (
                                  <div key={comp.id} className="p-4 border-b border-white/5 hover:bg-green-600/10 cursor-pointer flex justify-between items-center transition-colors" onClick={() => addComponentToBundle(b.localId, comp)}>
                                    <div>
                                      <p className="text-sm font-black">{comp.name}</p>
                                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{comp.brand_name} | {comp.model || "Standard"}</p>
                                    </div>
                                    <p className="text-green-400 font-mono font-bold">₹{comp.base_unit_price}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button 
                            onClick={() => setActiveBundleId(b.localId)} 
                            className="text-[10px] font-black text-green-500 hover:text-white border border-green-500/30 hover:bg-green-600 px-4 py-2 rounded-lg transition-all tracking-widest uppercase cursor-pointer"
                          >
                            + ADD EXTRA COMPONENT
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {billBundles.length > 0 && (
          <div className="mt-12 border-t border-white/10 pt-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="bg-[#1a1a1a] p-6 sm:p-8 rounded-3xl border border-white/10">
                <h4 className="text-xs font-black text-gray-500 mb-6 uppercase tracking-[0.2em]">Overall Adjustments</h4>
                <div className="flex flex-col gap-3">
                  <label className="filter-label">Total Order Discount (%)</label>
                  <input 
                    type="number" 
                    disabled={!!editBillId || isReadOnly} 
                    value={billDiscountPercent} 
                    onBlur={(e) => { if(e.target.value === "") setBillDiscountPercent(0); }}
                    onChange={(e) => setBillDiscountPercent(e.target.value === "" ? "" : Math.min(100, Math.max(0, Number(e.target.value))))} 
                    className="filter-select py-4! text-center font-bold text-xl disabled:opacity-50" 
                  />
                  <p className="text-[10px] text-gray-600 text-center mt-2">This discount is applied to the grand subtotal of all starters.</p>
                </div>
              </div>

              <div className="bg-green-600/5 border border-green-500/20 p-6 sm:p-8 rounded-3xl shadow-2xl">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="text-xs uppercase font-bold tracking-widest">Subtotal:</span>
                    <span className="font-mono font-bold text-lg">₹{billSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-red-400">
                    <span className="text-xs uppercase font-bold tracking-widest">Order Discount:</span>
                    <span className="font-mono font-bold">- ₹{billDiscountAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-t border-white/10 pt-6 mt-4 gap-2">
                    <span className="text-lg font-black uppercase tracking-tighter">Grand Total:</span>
                    <span className="text-4xl sm:text-5xl font-black text-green-400 font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                      ₹{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="mt-10">
                  {!editBillId && !isReadOnly ? (
                    <button onClick={handleCreateBill} className="primary-action-btn w-full text-sm! py-5! shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:shadow-red-600/50 cursor-pointer">
                      Generate Order
                    </button>
                  ) : (
                    <button onClick={() => navigate("/view-bills")} className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-xs">
                      Back to History
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBill;