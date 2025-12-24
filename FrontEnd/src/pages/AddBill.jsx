import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../api/base";
import * as XLSX from "xlsx";

const AddBill = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editBillId = location.state?.billId;

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

  const toggleBundle = (bundleId) => {
    setExpandedBundleIds((prev) =>
      prev.includes(bundleId) ? prev.filter((id) => id !== bundleId) : [...prev, bundleId]
    );
  };

  const recalcBundle = (bundle) => {
    const components = bundle.components.map((c) => {
      const disc = Number(c.discount_percent || 0);
      const discountedPrice = Number(c.base_price) * (1 - disc / 100);
      return { ...c, unit_price: discountedPrice };
    });
    const subtotal = components.reduce(
      (sum, c) => sum + Math.max(1, Number(c.quantity || 1)) * Number(c.unit_price || 0),
      0
    );
    return { ...bundle, components, subtotal, totalAfterDiscount: subtotal };
  };

  const billSubtotal = useMemo(() => billBundles.reduce((s, b) => s + b.totalAfterDiscount, 0), [billBundles]);
  const billDiscountAmount = Math.max(0, billSubtotal * (Number(billDiscountPercent) || 0)) / 100;
  const grandTotal = Math.max(billSubtotal - billDiscountAmount, 0);

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
            // MATCH WITH ORIGINAL PRODUCT TO RETRIEVE COMPONENTS
            const originalProduct = products.find(p => p.id === item.product_id);
            
            return {
              localId: `old-${idx}`,
              productId: item.product_id,
              starterType: item.product_name.split(" ")[0],
              ratingKw: item.product_name.split(" ")[1],
              // Map components from original product data so they can be expanded
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
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, token, role, authHeaders, editBillId]);

  /* ---------------- HANDLERS ---------------- */

  const handleAddBundle = () => {
    const prod = allBundles.find(p => p.starter_type === starterFilter && Number(p.rating_kw) === Number(ratingFilter));
    if (!prod) return alert("Bundle not found");

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
    setBillBundles(prev => [...prev, recalcBundle({
      localId: newId,
      productId: prod.id,
      starterType: prod.starter_type,
      ratingKw: prod.rating_kw,
      components,
      totalAfterDiscount: 0,
    })]);
    setExpandedBundleIds(prev => [...prev, newId]);
  };

  const removeBundle = (id) => {
    setBillBundles(prev => prev.filter(b => b.localId !== id));
    setExpandedBundleIds(prev => prev.filter(eid => eid !== id));
  };

  const updateQuantity = (bundleId, idx, value) => {
    const numValue = value === "" ? 1 : Math.max(1, parseInt(value));
    setBillBundles(prev => prev.map(b => {
      if (b.localId !== bundleId) return b;
      const components = [...b.components];
      components[idx].quantity = numValue;
      return recalcBundle({ ...b, components });
    }));
  };

  const updateComponentDiscount = (bundleId, idx, value) => {
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
    if (billBundles.length === 0) return;
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
    <div className="min-h-screen bg-[#0a0a0a]/80 mt-20 text-white font-sans pb-20 border-2 border-white/20 rounded-lg">
      <div className="max-w-5xl mx-auto p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          {editBillId ? "View Bill Details" : "Create New Bill"}
        </h1>

        {!editBillId && (
          <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl mb-8 shadow-2xl mt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 ml-1">Starter Type</label>
                <select value={starterFilter} onChange={(e) => {setStarterFilter(e.target.value); setRatingFilter("");}} className="bg-black/40 border border-white/10 p-3 rounded-xl focus:border-green-500 outline-none transition-colors">
                  <option value="">Select Type</option>
                  <option>DOL</option><option>RDOL</option><option>S/D</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 ml-1">Rating</label>
                <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="bg-black/40 border border-white/10 p-3 rounded-xl focus:border-green-500 outline-none transition-colors">
                  <option value="">Select Rating</option>
                  {allBundles.filter(b => b.starter_type === starterFilter).map(b => (
                    <option key={b.id} value={b.rating_kw}>{b.rating_kw} kW</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={handleAddBundle} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95">Add Bundle</button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {billBundles.map((b) => {
            const isExpanded = expandedBundleIds.includes(b.localId);
            return (
              <div key={b.localId} className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div onClick={() => toggleBundle(b.localId)} className="bg-white/5 p-4 flex justify-between items-center border-b border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`transition-transform duration-200 text-green-500 text-xs ${isExpanded ? "rotate-90" : "rotate-0"}`}>▶</span>
                    <span className="font-bold text-lg text-green-400">{b.starterType} — {b.ratingKw} kW</span>
                    {!editBillId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBundle(b.localId);
                        }}
                        className="text-gray-500 hover:text-red-500 transition-colors p-1"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <span className="text-sm font-mono text-gray-400">Bundle Subtotal: ₹{b.subtotal.toFixed(2)}</span>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-3 bg-black/10">
                    {b.components.map((c, idx) => (
                      <div key={idx} className="flex flex-wrap items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                        <div className="flex-1 min-w-[180px]">
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.brand_name} {c.model ? `| ${c.model}` : ""}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 md:mt-0">
                          <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase">Rate</p>
                            <p className="font-mono text-sm">₹{Number(c.unit_price || 0).toFixed(2)}</p>
                            {c.discount_percent > 0 && (
                                <p className="text-[9px] text-green-500 line-through">₹{c.base_price}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-500 uppercase">Qty</label>
                            <input type="number" disabled={!!editBillId} value={c.quantity} onClick={(e) => e.stopPropagation()} onChange={(e) => updateQuantity(b.localId, idx, e.target.value)} className="w-14 bg-black/40 border border-white/10 p-1 rounded-lg text-center outline-none focus:border-green-500 text-sm disabled:opacity-50" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-500 uppercase">Disc%</label>
                            <input type="number" disabled={!!editBillId} value={c.discount_percent} onClick={(e) => e.stopPropagation()} onChange={(e) => updateComponentDiscount(b.localId, idx, e.target.value)} className="w-14 bg-black/40 border border-green-900/30 p-1 rounded-lg text-center outline-none focus:border-green-500 text-sm text-green-400 disabled:opacity-50" />
                          </div>
                          {!editBillId && (
                            <button onClick={(e) => { e.stopPropagation(); removeComponent(b.localId, idx); }} className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-full transition-all">✕</button>
                          )}
                        </div>
                      </div>
                    ))}
                    {!editBillId && (
                      <div className="mt-4 border-t border-white/5 pt-4">
                        {activeBundleId === b.localId ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input type="text" placeholder="Search..." className="flex-1 bg-black/60 border border-white/10 p-2 rounded-lg outline-none text-sm" value={componentSearch} onChange={(e) => setComponentSearch(e.target.value)} autoFocus />
                              <button onClick={() => { setActiveBundleId(null); setComponentSearch(""); }} className="text-xs text-gray-500 px-2">Cancel</button>
                            </div>
                            {filteredComponents.length > 0 && (
                              <div className="max-h-40 overflow-y-auto bg-black/80 rounded-lg border border-white/10 shadow-2xl">
                                {filteredComponents.map((comp) => (
                                  <div key={comp.id} className="p-3 border-b border-white/5 hover:bg-green-600/20 cursor-pointer flex justify-between items-center" onClick={() => addComponentToBundle(b.localId, comp)}>
                                    <p className="text-sm font-bold">{comp.name}</p>
                                    <p className="text-green-400 font-mono text-xs">₹{comp.base_unit_price}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button onClick={() => setActiveBundleId(b.localId)} className="text-xs font-bold text-green-500 hover:text-green-400 transition-colors">+ ADD EXTRA COMPONENT</button>
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
          <div className="mt-10 border-t border-white/10 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10">
                <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase">Overall Adjustments</h4>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-400">Total Bill Discount (%)</label>
                  <input type="number" disabled={!!editBillId} value={billDiscountPercent} onChange={(e) => setBillDiscountPercent(e.target.value === "" ? "" : Math.min(100, Math.max(0, Number(e.target.value))))} className="bg-black/40 border border-white/10 p-3 rounded-xl outline-none focus:border-green-500 transition-all disabled:opacity-50" />
                </div>
              </div>
              <div className="bg-green-600/10 border border-green-500/20 p-6 rounded-2xl">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-400"><span>Subtotal:</span><span className="font-mono font-bold">₹{billSubtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-red-400"><span>Bill Discount:</span><span className="font-mono">- ₹{billDiscountAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-2">
                    <span className="text-lg font-bold">Grand Total:</span>
                    <span className="text-3xl font-black text-green-400 font-mono">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                {!editBillId ? (
                  <button onClick={handleCreateBill} className="w-full mt-6 bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl shadow-xl transition-all active:scale-95 uppercase tracking-widest">Generate Order</button>
                ) : (
                  <button onClick={() => navigate("/view-bills")} className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white font-black py-4 rounded-xl shadow-xl transition-all uppercase tracking-widest">Back to History</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBill;