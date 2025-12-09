// src/pages/AddBill.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../api/base";

const AddBill = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If we come from ViewBills
  const billIdFromView = location.state?.billId || null;
  const templateFromBillId = location.state?.templateFromBillId || null;

  // mode:
  // - "create" = fresh bill
  // - "view"   = viewing existing bill read-only
  // - "template" = editing bundles loaded from an old bill, will save as new bill
  const [mode, setMode] = useState(
    templateFromBillId ? "template" : billIdFromView ? "view" : "create"
  );

  const [allBundles, setAllBundles] = useState([]); // products from /products
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // selection for adding bundle
  const [starterFilter, setStarterFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  // bill content: list of bundles added to this bill
  const [billBundles, setBillBundles] = useState([]);

  // bill-level things
  const [billDiscountPercent, setBillDiscountPercent] = useState("");
  const [notes, setNotes] = useState("");
  const [billNumberPreview, setBillNumberPreview] = useState(null); // purely UI text

  const readOnly = mode === "view";

  // ---- helpers ----

  const authHeaders = useMemo(
    () =>
      token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    [token]
  );

  // distinct ratings for selected starter type
  const availableRatings = useMemo(() => {
    if (!starterFilter) return [];
    const ratings = allBundles
      .filter((p) => p.starter_type === starterFilter)
      .map((p) => Number(p.rating_kw));
    const uniq = [...new Set(ratings)];
    return uniq.sort((a, b) => a - b);
  }, [allBundles, starterFilter]);

  // bill subtotal (after component & bundle discounts, before bill-level discount)
  const billSubtotal = useMemo(
    () =>
      billBundles.reduce(
        (sum, b) => sum + (Number(b.totalAfterDiscount) || 0),
        0
      ),
    [billBundles]
  );

  const billDiscountAmount = useMemo(() => {
    const percent = Number(billDiscountPercent) || 0;
    return (billSubtotal * percent) / 100;
  }, [billSubtotal, billDiscountPercent]);

  const grandTotal = useMemo(
    () => Math.max(billSubtotal - billDiscountAmount, 0),
    [billSubtotal, billDiscountAmount]
  );

  const hasBundles = billBundles.length > 0;

  // ---- initial load ----

  useEffect(() => {
    // auth guard
    if (!token) {
      navigate("/login");
      return;
    }
    if (role !== "admin" && role !== "user") {
      navigate("/unauthorized");
      return;
    }

    const init = async () => {
      try {
        const productsRes = await axios.get(`${API_URL}/products`, {
          headers: authHeaders,
        });
        setAllBundles(productsRes.data || []);

        // If we came from an existing bill (view or template), load it
        const billIdToLoad = templateFromBillId || billIdFromView;
        if (billIdToLoad) {
          const billRes = await axios.get(
            `${API_URL}/billing/${billIdToLoad}`,
            { headers: authHeaders }
          );
          const bill = billRes.data;

          // Very simple notes load; discounts are re-applied fresh in UI
          setNotes(bill.notes || "");

          const mappedBundles = [];
          bill.items.forEach((item, index) => {
            const prod = productsRes.data.find(
              (p) => p.id === item.product_id
            );
            if (!prod) return;

            const components =
              (prod.components || []).map((c) => ({
                id: c.id,
                name: c.name,
                brand_name: c.brand_name,
                model: c.model,
                quantity: Number(c.quantity),
                unit_price: Number(c.unit_price),
                final_unit_price: Number(c.unit_price),
              })) || [];

            const subtotal = components.reduce(
              (sum, c) =>
                sum + (Number(c.final_unit_price) || 0) * (Number(c.quantity) || 0),
              0
            );

            mappedBundles.push({
              localId: `${prod.id}-${index}-${Date.now()}`,
              productId: prod.id,
              starterType: prod.starter_type,
              ratingKw: Number(prod.rating_kw),
              components,
              bundleDiscountPercent: 0,
              subtotal,
              totalAfterDiscount: subtotal,
            });
          });

          setBillBundles(mappedBundles);

          if (mode === "view") {
            setBillNumberPreview(bill.bill_number);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.detail || "Failed to load bill data");
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- bundle helpers ----

  const recalcBundle = (bundle) => {
    const subtotal = (bundle.components || []).reduce(
      (sum, c) =>
        sum +
        (Number(c.final_unit_price ?? c.unit_price) || 0) *
          (Number(c.quantity) || 0),
      0
    );
    const discPercent = Number(bundle.bundleDiscountPercent) || 0;
    const discountAmount = (subtotal * discPercent) / 100;
    const totalAfterDiscount = Math.max(subtotal - discountAmount, 0);

    return {
      ...bundle,
      subtotal,
      totalAfterDiscount,
    };
  };

  const handleAddBundle = () => {
    if (readOnly) return;

    if (!starterFilter || !ratingFilter) {
      alert("Please select starter type and rating.");
      return;
    }

    const ratingValue = Number(ratingFilter);
    const prod = allBundles.find(
      (p) =>
        p.starter_type === starterFilter &&
        Number(p.rating_kw) === ratingValue
    );
    if (!prod) {
      alert("No bundle found for this starter type and rating.");
      return;
    }

    const components =
      (prod.components || []).map((c) => ({
        id: c.id,
        name: c.name,
        brand_name: c.brand_name,
        model: c.model,
        quantity: Number(c.quantity),
        unit_price: Number(c.unit_price),
        final_unit_price: Number(c.unit_price),
      })) || [];

    let newBundle = {
      localId: `${prod.id}-${Date.now()}`,
      productId: prod.id,
      starterType: prod.starter_type,
      ratingKw: Number(prod.rating_kw),
      components,
      bundleDiscountPercent: 0,
      subtotal: 0,
      totalAfterDiscount: 0,
    };
    newBundle = recalcBundle(newBundle);

    setBillBundles((prev) => [...prev, newBundle]);

    // Once the first bundle is added, we can show a "Bill ID will be generated" text.
    if (!billNumberPreview) {
      setBillNumberPreview("Will be generated when bill is created");
    }
  };

  const handleRemoveBundle = (localId) => {
    if (readOnly) return;
    setBillBundles((prev) => prev.filter((b) => b.localId !== localId));
  };

  const handleToggleExpand = (localId) => {
    setBillBundles((prev) =>
      prev.map((b) =>
        b.localId === localId ? { ...b, expanded: !b.expanded } : b
      )
    );
  };

  const handleComponentChange = (bundleId, index, field, value) => {
    if (readOnly) return;
    setBillBundles((prev) =>
      prev.map((b) => {
        if (b.localId !== bundleId) return b;
        const copy = [...(b.components || [])];
        const updated = { ...copy[index], [field]: value };
        // ensure numeric for qty / price
        if (field === "quantity") {
          updated.quantity = value === "" ? "" : Number(value);
        }
        if (field === "final_unit_price") {
          updated.final_unit_price = value === "" ? "" : Number(value);
        }
        copy[index] = updated;
        return recalcBundle({ ...b, components: copy });
      })
    );
  };

  const handleAddComponentRow = (bundleId) => {
    if (readOnly) return;
    setBillBundles((prev) =>
      prev.map((b) => {
        if (b.localId !== bundleId) return b;
        const copy = [
          ...(b.components || []),
          {
            id: null,
            name: "",
            brand_name: "",
            model: "",
            quantity: 1,
            unit_price: 0,
            final_unit_price: 0,
          },
        ];
        return recalcBundle({ ...b, components: copy });
      })
    );
  };

  const handleRemoveComponentRow = (bundleId, index) => {
    if (readOnly) return;
    setBillBundles((prev) =>
      prev.map((b) => {
        if (b.localId !== bundleId) return b;
        if ((b.components || []).length <= 1) return b;
        const copy = (b.components || []).filter((_, i) => i !== index);
        return recalcBundle({ ...b, components: copy });
      })
    );
  };

  const handleBundleDiscountChange = (bundleId, value) => {
    if (readOnly) return;
    setBillBundles((prev) =>
      prev.map((b) => {
        if (b.localId !== bundleId) return b;
        return recalcBundle({
          ...b,
          bundleDiscountPercent: value,
        });
      })
    );
  };

  const handleUseAsTemplate = () => {
    // re-open this page but in template (editable) mode
    navigate("/add-bill", {
      state: { templateFromBillId: billIdFromView },
    });
  };

  const handleCreateBill = async () => {
    if (readOnly) return;

    setError("");

    if (!token) {
      setError("⚠️ Please login first");
      return;
    }
    if (billBundles.length === 0) {
      setError("Please add at least one bundle to the bill.");
      return;
    }

    try {
      const items = billBundles.map((b) => ({
        product_id: b.productId,
        quantity: 1,
        override_price: Number(b.totalAfterDiscount) || 0,
      }));

      const payload = {
        items,
        discount_amount: billDiscountAmount || 0,
        notes,
      };

      const res = await axios.post(`${API_URL}/billing`, payload, {
        headers: authHeaders,
      });

      alert(`Bill created! ID: ${res.data.bill_number}`);

      // reset UI and go to View Bills
      setBillBundles([]);
      setStarterFilter("");
      setRatingFilter("");
      setBillDiscountPercent("");
      setNotes("");
      setBillNumberPreview(null);

      navigate("/view-bills");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to create bill");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-white">
        <h1 className="text-2xl font-bold">New Bill</h1>
        <p className="mt-4 text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold">
        {mode === "view"
          ? "Bill Details"
          : mode === "template"
          ? "New Bill (from Template)"
          : "New Bill"}
      </h1>

      {error && (
        <p className="text-red-500 bg-red-500/10 border border-red-600/40 p-2 rounded mt-4 text-sm">
          {error}
        </p>
      )}

      {/* Bill ID area */}
      {hasBundles && (
        <div className="mt-4 bg-gray-900 p-3 rounded">
          <p className="text-sm text-gray-300">
            Bill ID:{" "}
            <span className="font-semibold">
              {billNumberPreview || "Will be generated when bill is created"}
            </span>
          </p>
        </div>
      )}

      {/* Top controls – choose bundle */}
      {!readOnly && (
        <div className="bg-gray-900 p-4 mt-4 rounded">
          <div className="grid grid-cols-3 gap-3 items-end">
            <select
              value={starterFilter}
              onChange={(e) => {
                setStarterFilter(e.target.value);
                setRatingFilter("");
              }}
              className="bg-gray-800 px-3 py-2 rounded outline-none"
            >
              <option value="">Starter Type</option>
              <option value="DOL">DOL</option>
              <option value="RDOL">RDOL</option>
              <option value="S/D">S/D</option>
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="bg-gray-800 px-3 py-2 rounded outline-none"
            >
              <option value="">Rating (kW)</option>
              {availableRatings.map((r) => (
                <option key={r} value={r}>
                  {r} kW
                </option>
              ))}
            </select>

            <button
              onClick={handleAddBundle}
              className="bg-green-600 px-4 py-2 rounded"
            >
              Add to Bill
            </button>
          </div>
        </div>
      )}

      {/* Bundles in this bill */}
      {billBundles.map((bundle) => (
        <div
          key={bundle.localId}
          className="bg-gray-900 p-4 mt-4 rounded cursor-pointer"
          onClick={() => handleToggleExpand(bundle.localId)}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">
                {bundle.starterType} — {bundle.ratingKw} kW
              </p>
              <p className="text-sm text-gray-400">
                Click to {bundle.expanded ? "collapse" : "expand"} components
              </p>
            </div>

            <div className="flex items-center gap-4">
              <p className="font-semibold">
                ₹{(bundle.totalAfterDiscount || 0).toFixed(2)}
              </p>

              {!readOnly && (
                <button
                  className="px-3 py-1 bg-red-600 rounded text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveBundle(bundle.localId);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {bundle.expanded && (
            <div className="mt-4">
              <p className="font-semibold text-sm mb-2">
                Components in this bundle
              </p>

              {(bundle.components || []).map((c, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800 px-3 py-2 rounded mb-2 flex flex-col gap-1"
                >
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">{c.name || "Component"}</span>
                    {!readOnly && (
                      <button
                        className="text-red-300 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveComponentRow(bundle.localId, idx);
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    placeholder="Name"
                    value={c.name}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleComponentChange(
                        bundle.localId,
                        idx,
                        "name",
                        e.target.value
                      )
                    }
                    className="bg-gray-900 px-2 py-1 rounded outline-none text-xs mt-1"
                  />
                  <input
                    placeholder="Brand"
                    value={c.brand_name}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleComponentChange(
                        bundle.localId,
                        idx,
                        "brand_name",
                        e.target.value
                      )
                    }
                    className="bg-gray-900 px-2 py-1 rounded outline-none text-xs"
                  />
                  <input
                    placeholder="Model (optional)"
                    value={c.model || ""}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleComponentChange(
                        bundle.localId,
                        idx,
                        "model",
                        e.target.value
                      )
                    }
                    className="bg-gray-900 px-2 py-1 rounded outline-none text-xs"
                  />

                  <div className="flex gap-2 mt-1">
                    <input
                      placeholder="Qty"
                      value={c.quantity}
                      disabled={readOnly}
                      onChange={(e) =>
                        handleComponentChange(
                          bundle.localId,
                          idx,
                          "quantity",
                          e.target.value
                        )
                      }
                      className="bg-gray-900 px-2 py-1 rounded outline-none text-xs w-1/3"
                    />
                    <input
                      placeholder="Unit Price"
                      value={c.final_unit_price}
                      disabled={readOnly}
                      onChange={(e) =>
                        handleComponentChange(
                          bundle.localId,
                          idx,
                          "final_unit_price",
                          e.target.value
                        )
                      }
                      className="bg-gray-900 px-2 py-1 rounded outline-none text-xs w-1/3"
                    />
                    <div className="text-xs flex items-center justify-end w-1/3">
                      Line: ₹
                      {(
                        (Number(c.final_unit_price || 0) || 0) *
                        (Number(c.quantity || 0) || 0)
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              {!readOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddComponentRow(bundle.localId);
                  }}
                  className="mt-2 text-xs text-green-400 hover:text-green-300 cursor-pointer"
                >
                  + Add Component
                </button>
              )}

              {!readOnly && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span>Bundle Discount (%):</span>
                  <input
                    type="number"
                    value={bundle.bundleDiscountPercent}
                    onChange={(e) =>
                      handleBundleDiscountChange(
                        bundle.localId,
                        e.target.value
                      )
                    }
                    className="bg-gray-800 px-2 py-1 rounded outline-none w-20"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Bill-level discount & notes */}
      {hasBundles && (
        <>
          <input
            type="number"
            placeholder="Bill Discount (%)"
            value={billDiscountPercent}
            disabled={readOnly}
            onChange={(e) => setBillDiscountPercent(e.target.value)}
            className="input mt-5"
          />

          <textarea
            placeholder="Notes"
            value={notes}
            disabled={readOnly}
            onChange={(e) => setNotes(e.target.value)}
            className="input mt-3 h-20"
          />
        </>
      )}

      {/* BILL SUMMARY */}
      {hasBundles && (
        <div className="mt-5 bg-gray-800 p-0 rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 border-b border-gray-700">
            <p className="px-4 py-2 text-right">Subtotal (bundles):</p>
            <p className="px-4 py-2 font-semibold">
              ₹{billSubtotal.toFixed(2)}
            </p>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-700">
            <p className="px-4 py-2 text-right">Bill Discount Amount:</p>
            <p className="px-4 py-2 font-semibold">
              ₹{billDiscountAmount.toFixed(2)}
            </p>
          </div>
          <div className="grid grid-cols-2">
            <p className="px-4 py-2 text-right">Grand Total:</p>
            <p className="px-4 py-2 font-semibold">
              ₹{grandTotal.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* bottom actions */}
      <div className="mt-6 flex gap-3">
        {mode === "view" && (
          <button
            onClick={handleUseAsTemplate}
            className="bg-green-600 px-4 py-2 rounded"
          >
            Use as Template
          </button>
        )}

        {!readOnly && (
          <button
            onClick={handleCreateBill}
            className="bg-green-600 px-4 py-2 rounded"
          >
            Create Bill
          </button>
        )}

        <button
          onClick={() => navigate("/view-bills")}
          className="bg-gray-700 px-4 py-2 rounded"
        >
          Back to Bills
        </button>
      </div>
    </div>
  );
};

export default AddBill;