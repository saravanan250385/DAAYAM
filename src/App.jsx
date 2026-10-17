import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";

const typeMeta = {
  bank: { icon: "BK", label: "Bank" },
  loan: { icon: "LN", label: "Loan" },
  insurance: { icon: "IN", label: "Insurance" },
  subscription: { icon: "SB", label: "Subscription" },
  verification: { icon: "VR", label: "Verification" },
  nominee: { icon: "NM", label: "Nominee" },
};

function getTypeMeta(type) {
  return typeMeta[type] || { icon: "OT", label: "Other" };
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  let data = {};

  try {
    data = await response.json();
  } catch (_error) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || "Unable to complete request.");
  }

  return data;
}

function createId() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function useToast() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const showToast = (text) => {
    setMessage(text);
    setVisible(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => setVisible(false), 2600);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    showToast,
    toastNode: <div className={`toast ${visible ? "show" : ""}`}>{message}</div>,
  };
}

function useDashboardSnapshot(showToast) {
  const [data, setData] = useState({
    assets: [],
    nominees: [],
    guardians: [],
    insights: [],
    readinessScore: 0,
    familyAccess: {},
    emergencyVerification: {},
  });
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    try {
      setLoading(true);
      const next = await fetchJson("/assets");
      setData(next);
    } catch (error) {
      showToast(error.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  return { data, loading, reload };
}

function AppLayout({ children }) {
  return (
    <div className="page-shell">
      <nav className="top-nav">
        <NavLink className="brand-lockup" to="/">
          <img className="brand-logo" src="/DAAYAM_LOGO.png" alt="DAAYAM logo" />
          <span className="brand-copy">
            <strong className="brand-title">DAAYAM</strong>
            <small>Family Financial Readiness Platform</small>
          </span>
        </NavLink>
        <div className="nav-links">
          <NavItem to="/" label="Home" end />
          <NavItem to="/dashboard" label="Dashboard" />
          <NavItem to="/assets" label="Assets" />
          <NavItem to="/nominees" label="Nominees" />
          <NavItem to="/grief" label="Grief Mode" />
        </div>
      </nav>
      {children}
    </div>
  );
}

function NavItem({ to, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`.trim()}
    >
      {label}
    </NavLink>
  );
}

function HomePage() {
  return (
    <>
      <header className="hero-simple">
        <div>
          <p className="eyebrow">Trusted Family Operations</p>
          <h1>One place to prepare. One simple flow when a family needs help.</h1>
          <p className="hero-copy">
            DAAYAM helps families map assets, verify nominees, and generate a clear financial first aid
            kit after death or disability.
          </p>
          <div className="hero-actions">
            <NavLink className="nav-link" to="/manage">
              Start setup
            </NavLink>
            <NavLink className="nav-link" to="/grief">
              Open grief mode
            </NavLink>
          </div>
        </div>
        <div className="hero-badges">
          <div className="mini-card">
            <small>Mapped footprint</small>
            <strong>Accounts, loans, insurance, mandates</strong>
          </div>
          <div className="mini-card">
            <small>Protected release</small>
            <strong>Only verified family access</strong>
          </div>
        </div>
      </header>

      <section className="brand-ribbon" aria-label="DAAYAM benefits">
        <span>Private-by-design records</span>
        <span>Nominee verification workflow</span>
        <span>Emergency checklist in minutes</span>
      </section>

      <main className="page-grid">
        <NavLink className="route-card" to="/dashboard">
          <small>Overview</small>
          <h2>Dashboard</h2>
          <p>See mapped accounts, nominees, risks, and readiness in one place.</p>
        </NavLink>
        <NavLink className="route-card" to="/assets">
          <small>Setup</small>
          <h2>Assets</h2>
          <p>Add bank accounts, loans, insurance policies, and subscriptions.</p>
        </NavLink>
        <NavLink className="route-card" to="/nominees">
          <small>Setup</small>
          <h2>Nominees</h2>
          <p>Add family members, verify identity, and prepare protected access.</p>
        </NavLink>
        <NavLink className="route-card route-card-accent" to="/grief">
          <small>Family Flow</small>
          <h2>Grief Mode</h2>
          <p>Verify the event and show the next steps to claim, cancel, and transfer.</p>
        </NavLink>
      </main>

      <section className="panel spotlight-panel">
        <div className="section-title split">
          <div>
            <p className="kicker">Why This Matters</p>
            <h2>Built for the aftermath, not the transaction.</h2>
          </div>
        </div>
        <div className="overview-grid">
          <div className="spot-card">
            <small>Before DAAYAM</small>
            <strong>Families do not know what existed.</strong>
            <p>Accounts stay hidden, claims get missed, and auto-debits continue quietly.</p>
          </div>
          <div className="spot-card">
            <small>With DAAYAM</small>
            <strong>Everything is mapped and ready.</strong>
            <p>Approved family members see exactly what to claim, cancel, and transfer.</p>
          </div>
          <div className="spot-card">
            <small>Emergency Outcome</small>
            <strong>Less confusion. Less loss. Faster action.</strong>
            <p>The first-aid kit converts financial chaos into a clear step-by-step flow.</p>
          </div>
        </div>
      </section>
    </>
  );
}

function DashboardPage({ showToast }) {
  const { data, loading } = useDashboardSnapshot(showToast);
  const verifiedCount = data.nominees.filter((nominee) => nominee.verificationStatus === "verified").length;
  const autoDebitCount = data.assets.filter((asset) => asset.autoDebit).length;

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Family vault status</h1>
          <p className="hero-copy">A simple summary of assets, nominee readiness, and active financial risks.</p>
        </div>
      </header>

      <main className="stack-layout">
        <section className="panel">
          <div className="metric-row">
            <div className="metric-card"><span>{data.readinessScore || 0}%</span><small>Protection score</small></div>
            <div className="metric-card"><span>{data.assets.length}</span><small>Assets</small></div>
            <div className="metric-card"><span>{data.nominees.length}</span><small>Nominees</small></div>
            <div className="metric-card"><span>{verifiedCount}</span><small>Verified nominees</small></div>
            <div className="metric-card"><span>{autoDebitCount}</span><small>Auto-debits</small></div>
          </div>
          <div className="mini-grid">
            {(data.insights || []).map((insight) => (
              <div className="mini-card" key={createId()}>
                <small>{insight.label}</small>
                <strong>{insight.value}</strong>
              </div>
            ))}
            {!data.insights?.length && !loading && <div className="empty-state">No insights available.</div>}
          </div>
        </section>

        <section className="panel">
          <div className="section-title split">
            <div>
              <p className="kicker">Emergency Timeline</p>
              <h2>What happens when the family opens DAAYAM</h2>
            </div>
            <NavLink className="text-link" to="/grief">
              Open grief mode
            </NavLink>
          </div>
          <div className="overview-grid">
            <div className="spot-card">
              <small>Next 5 Minutes</small>
              <strong>Verify event and release approved access.</strong>
              <p>Only verified nominees are shown the protected family vault.</p>
            </div>
            <div className="spot-card">
              <small>Today</small>
              <strong>Stop payment leaks.</strong>
              <p>Auto-debits, subscriptions, and loan actions appear in one checklist.</p>
            </div>
            <div className="spot-card">
              <small>This Week</small>
              <strong>Start claims and transfers.</strong>
              <p>Insurance, bank settlement, and institution guidance stay in one place.</p>
            </div>
          </div>
        </section>

        <section className="two-col">
          <section className="panel">
            <div className="section-title split">
              <div>
                <p className="kicker">Assets</p>
                <h2>Mapped financial footprint</h2>
              </div>
              <NavLink className="text-link" to="/assets">
                Manage assets
              </NavLink>
            </div>
            <div className="card-list">
              {data.assets.map((asset) => (
                <AssetCard asset={asset} nominees={data.nominees} key={asset.id} />
              ))}
              {!data.assets.length && !loading && <div className="empty-state">No assets added yet.</div>}
            </div>
          </section>

          <section className="panel">
            <div className="section-title split">
              <div>
                <p className="kicker">Nominees</p>
                <h2>Verification status</h2>
              </div>
              <NavLink className="text-link" to="/nominees">
                Open nominees
              </NavLink>
            </div>
            <div className="card-list">
              {data.nominees.map((nominee) => (
                <NomineeCard nominee={nominee} key={nominee.id} hideButton />
              ))}
              {!data.nominees.length && !loading && <div className="empty-state">No nominees added yet.</div>}
            </div>
          </section>
        </section>
      </main>
    </>
  );
}

function AssetCard({ asset, nominees }) {
  const meta = getTypeMeta(asset.type);
  const nomineeName = nominees.find((nominee) => nominee.id === asset.nomineeId)?.name || "Not linked";
  return (
    <article className="asset-card">
      <div className="asset-head">
        <div className="asset-meta">
          <strong>{asset.name || asset.provider}</strong>
          <span className="inline-detail">{asset.provider}</span>
        </div>
        <div className="tag-row">
          <span className="pill">{meta.icon} {meta.label}</span>
          <span className={`status-pill ${asset.status}`}>{asset.status}</span>
        </div>
      </div>
      <div className="inline-detail">Value: {asset.value || "Not specified"}</div>
      <div className="inline-detail">Linked nominee: {nomineeName}</div>
      <div className="inline-detail">UPI source: {asset.upiApp || "Not mapped"}</div>
    </article>
  );
}

function NomineeCard({ nominee, onVerify, hideButton = false }) {
  const isVerified = nominee.verificationStatus === "verified";
  return (
    <article className="nominee-card">
      <div className="nominee-head">
        <div className="nominee-meta">
          <strong>{nominee.name}</strong>
          <span className="inline-detail">{nominee.relation} | {nominee.contact}</span>
        </div>
        <span className={`${isVerified ? "verification-verified" : "verification-pending"} status-pill`}>
          {nominee.verificationStatus}
        </span>
      </div>
      <div className="inline-detail">ID: {nominee.idType} | {nominee.idNumber}</div>
      <div className="verification-note">{nominee.verificationNote}</div>
      {!hideButton && (
        <div className="nominee-actions">
          <button
            className="verify-btn"
            type="button"
            disabled={isVerified}
            onClick={() => onVerify?.(nominee.id)}
          >
            {isVerified ? "Verified" : "Verify Nominee"}
          </button>
        </div>
      )}
    </article>
  );
}

function AssetsPage({ showToast }) {
  const { data, loading, reload } = useDashboardSnapshot(showToast);
  const [form, setForm] = useState({
    type: "",
    name: "",
    provider: "",
    value: "",
    upiApp: "",
    nomineeId: "",
    status: "active",
    notes: "",
    autoDebit: false,
  });

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetchJson("/add-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      showToast(response.message || "Asset saved.");
      setForm({
        type: "",
        name: "",
        provider: "",
        value: "",
        upiApp: "",
        nomineeId: "",
        status: "active",
        notes: "",
        autoDebit: false,
      });
      await reload();
    } catch (error) {
      showToast(error.message || "Unable to save asset.");
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Setup</p>
          <h1>Add and review assets</h1>
          <p className="hero-copy">Map bank accounts, loans, insurance, subscriptions, and UPI-linked mandates.</p>
        </div>
      </header>

      <main className="two-col">
        <section className="panel">
          <p className="kicker">New asset</p>
          <h2>Save to protected vault</h2>
          <form className="form-grid" onSubmit={onSubmit}>
            <label>Asset Type
              <select name="type" value={form.type} onChange={onChange} required>
                <option value="">Select type</option>
                <option value="bank">Bank Account</option>
                <option value="loan">Loan</option>
                <option value="insurance">Insurance</option>
                <option value="subscription">Subscription</option>
              </select>
            </label>
            <label>Asset Name<input name="name" value={form.name} onChange={onChange} type="text" placeholder="Savings Account, Life Cover" /></label>
            <label>Provider / Institution<input name="provider" value={form.provider} onChange={onChange} type="text" placeholder="HDFC Bank, LIC, PhonePe" required /></label>
            <label>Approximate Value<input name="value" value={form.value} onChange={onChange} type="text" placeholder="Rs 8,50,000 or Rs 999/month" /></label>
            <label>UPI App / Source<input name="upiApp" value={form.upiApp} onChange={onChange} type="text" placeholder="Google Pay, Paytm, PhonePe" /></label>
            <label>Linked Nominee
              <select name="nomineeId" value={form.nomineeId} onChange={onChange}>
                <option value="">No nominee linked yet</option>
                {data.nominees.map((nominee) => (
                  <option key={nominee.id} value={nominee.id}>{nominee.name} ({nominee.verificationStatus})</option>
                ))}
              </select>
            </label>
            <label>Status
              <select name="status" value={form.status} onChange={onChange}>
                <option value="active">Active</option>
                <option value="review">Needs Review</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="full-span">Notes<textarea name="notes" value={form.notes} onChange={onChange} rows="3" placeholder="Branch, policy, or account notes" /></label>
            <label className="checkbox-field full-span"><input name="autoDebit" checked={form.autoDebit} onChange={onChange} type="checkbox" /><span>This item has active auto-debit or UPI mandate</span></label>
            <button type="submit" className="primary-btn full-span">Save Asset</button>
          </form>
        </section>

        <section className="panel">
          <div className="section-title split">
            <div>
              <p className="kicker">Saved assets</p>
              <h2>Mapped items</h2>
            </div>
            <div className="metric-card compact-metric"><span>{data.assets.length}</span><small>Assets</small></div>
          </div>
          <div className="card-list">
            {data.assets.map((asset) => (
              <AssetCard asset={asset} nominees={data.nominees} key={asset.id} />
            ))}
            {!data.assets.length && !loading && <div className="empty-state">No assets added yet.</div>}
          </div>
        </section>
      </main>
    </>
  );
}

function NomineesPage({ showToast }) {
  const { data, loading, reload } = useDashboardSnapshot(showToast);
  const [form, setForm] = useState({
    name: "",
    contact: "",
    relation: "",
    idType: "",
    idNumber: "",
  });

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetchJson("/add-nominee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      showToast(response.message || "Nominee saved.");
      setForm({ name: "", contact: "", relation: "", idType: "", idNumber: "" });
      await reload();
    } catch (error) {
      showToast(error.message || "Unable to save nominee.");
    }
  };

  const verifyNominee = async (id) => {
    try {
      const response = await fetchJson(`/verify-nominee/${id}`, { method: "POST" });
      showToast(response.message || "Nominee verified.");
      await reload();
    } catch (error) {
      showToast(error.message || "Unable to verify nominee.");
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Setup</p>
          <h1>Add and verify nominees</h1>
          <p className="hero-copy">Register family members and approve them for protected access.</p>
        </div>
      </header>

      <main className="two-col">
        <section className="panel">
          <p className="kicker">New nominee</p>
          <h2>Add family member</h2>
          <form className="form-grid" onSubmit={submit}>
            <label>Full Name<input name="name" value={form.name} onChange={onChange} type="text" placeholder="Priya Sharma" required /></label>
            <label>Contact<input name="contact" value={form.contact} onChange={onChange} type="text" placeholder="+91 98xxxxxx or email" required /></label>
            <label>Relationship<input name="relation" value={form.relation} onChange={onChange} type="text" placeholder="Spouse, Parent, Sibling" required /></label>
            <label>ID Type
              <select name="idType" value={form.idType} onChange={onChange} required>
                <option value="">Select ID type</option>
                <option value="Aadhaar">Aadhaar</option>
                <option value="PAN">PAN</option>
                <option value="Passport">Passport</option>
                <option value="Driver License">Driver License</option>
              </select>
            </label>
            <label className="full-span">ID Number<input name="idNumber" value={form.idNumber} onChange={onChange} type="text" placeholder="Enter masked or demo ID number" required /></label>
            <button type="submit" className="secondary-btn full-span">Save Nominee</button>
          </form>
        </section>

        <section className="panel">
          <div className="section-title split">
            <div>
              <p className="kicker">Verification</p>
              <h2>Approved family members</h2>
            </div>
            <div className="metric-card compact-metric"><span>{data.nominees.length}</span><small>Nominees</small></div>
          </div>
          <div className="card-list">
            {data.nominees.map((nominee) => (
              <NomineeCard nominee={nominee} key={nominee.id} onVerify={verifyNominee} />
            ))}
            {!data.nominees.length && !loading && <div className="empty-state">No nominees added yet.</div>}
          </div>
        </section>
      </main>
    </>
  );
}

function ManagePage({ showToast }) {
  const { data, loading, reload } = useDashboardSnapshot(showToast);
  const verifiedCount = data.nominees.filter((nominee) => nominee.verificationStatus === "verified").length;
  const autoDebits = data.assets.filter((asset) => asset.autoDebit).length;

  const [assetForm, setAssetForm] = useState({
    type: "",
    name: "",
    provider: "",
    value: "",
    upiApp: "",
    nomineeId: "",
    status: "active",
    notes: "",
    autoDebit: false,
  });
  const [nomineeForm, setNomineeForm] = useState({
    name: "",
    contact: "",
    relation: "",
    idType: "",
    idNumber: "",
  });

  const onAssetChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAssetForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onNomineeChange = (event) => {
    const { name, value } = event.target;
    setNomineeForm((prev) => ({ ...prev, [name]: value }));
  };

  const addAsset = async (event) => {
    event.preventDefault();
    try {
      const response = await fetchJson("/add-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assetForm),
      });
      showToast(response.message || "Asset saved.");
      setAssetForm({
        type: "",
        name: "",
        provider: "",
        value: "",
        upiApp: "",
        nomineeId: "",
        status: "active",
        notes: "",
        autoDebit: false,
      });
      await reload();
    } catch (error) {
      showToast(error.message || "Unable to save asset.");
    }
  };

  const addNominee = async (event) => {
    event.preventDefault();
    try {
      const response = await fetchJson("/add-nominee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nomineeForm),
      });
      showToast(response.message || "Nominee saved.");
      setNomineeForm({ name: "", contact: "", relation: "", idType: "", idNumber: "" });
      await reload();
    } catch (error) {
      showToast(error.message || "Unable to save nominee.");
    }
  };

  const verifyNominee = async (id) => {
    try {
      const response = await fetchJson(`/verify-nominee/${id}`, { method: "POST" });
      showToast(response.message || "Nominee verified.");
      await reload();
    } catch (error) {
      showToast(error.message || "Unable to verify nominee.");
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Setup</p>
          <h1>Set up the family&apos;s protected financial vault.</h1>
          <p className="hero-copy">Add assets, map nominees, and keep the account ready before an emergency happens.</p>
        </div>
      </header>

      <main className="two-col">
        <section className="panel">
          <p className="kicker">Protected Vault</p>
          <h2>Add financial asset</h2>
          <form className="form-grid" onSubmit={addAsset}>
            <label>Asset Type
              <select name="type" value={assetForm.type} onChange={onAssetChange} required>
                <option value="">Select type</option>
                <option value="bank">Bank Account</option>
                <option value="loan">Loan</option>
                <option value="insurance">Insurance</option>
                <option value="subscription">Subscription</option>
              </select>
            </label>
            <label>Asset Name<input name="name" value={assetForm.name} onChange={onAssetChange} type="text" placeholder="Savings Account, Life Cover" /></label>
            <label>Provider / Institution<input name="provider" value={assetForm.provider} onChange={onAssetChange} type="text" placeholder="HDFC Bank, LIC, PhonePe" required /></label>
            <label>Approximate Value<input name="value" value={assetForm.value} onChange={onAssetChange} type="text" placeholder="Rs 8,50,000 or Rs 999/month" /></label>
            <label>UPI App / Source<input name="upiApp" value={assetForm.upiApp} onChange={onAssetChange} type="text" placeholder="Google Pay, Paytm, PhonePe" /></label>
            <label>Linked Nominee
              <select name="nomineeId" value={assetForm.nomineeId} onChange={onAssetChange}>
                <option value="">No nominee linked yet</option>
                {data.nominees.map((nominee) => (
                  <option key={nominee.id} value={nominee.id}>{nominee.name} ({nominee.verificationStatus})</option>
                ))}
              </select>
            </label>
            <label>Status
              <select name="status" value={assetForm.status} onChange={onAssetChange}>
                <option value="active">Active</option>
                <option value="review">Needs Review</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="full-span">Notes<textarea name="notes" value={assetForm.notes} onChange={onAssetChange} rows="3" placeholder="Branch, policy, or account notes" /></label>
            <label className="checkbox-field full-span"><input name="autoDebit" checked={assetForm.autoDebit} onChange={onAssetChange} type="checkbox" /><span>This item has active auto-debit or UPI mandate</span></label>
            <button type="submit" className="primary-btn full-span">Save Asset</button>
          </form>
        </section>

        <section className="panel">
          <p className="kicker">Family Access</p>
          <h2>Add nominee or caregiver</h2>
          <form className="form-grid" onSubmit={addNominee}>
            <label>Full Name<input name="name" value={nomineeForm.name} onChange={onNomineeChange} type="text" placeholder="Priya Sharma" required /></label>
            <label>Contact<input name="contact" value={nomineeForm.contact} onChange={onNomineeChange} type="text" placeholder="+91 98xxxxxx or email" required /></label>
            <label>Relationship<input name="relation" value={nomineeForm.relation} onChange={onNomineeChange} type="text" placeholder="Spouse, Parent, Sibling" required /></label>
            <label>ID Type
              <select name="idType" value={nomineeForm.idType} onChange={onNomineeChange} required>
                <option value="">Select ID type</option>
                <option value="Aadhaar">Aadhaar</option>
                <option value="PAN">PAN</option>
                <option value="Passport">Passport</option>
                <option value="Driver License">Driver License</option>
              </select>
            </label>
            <label className="full-span">ID Number<input name="idNumber" value={nomineeForm.idNumber} onChange={onNomineeChange} type="text" placeholder="Enter masked or demo ID number" required /></label>
            <button type="submit" className="secondary-btn full-span">Save Nominee</button>
          </form>
        </section>

        <section className="panel full-width">
          <div className="section-title split">
            <div>
              <p className="kicker">Vault Overview</p>
              <h2>Assets and nominees</h2>
            </div>
            <div className="overview-grid compact-overview">
              <div className="metric-card"><span>{data.assets.length}</span><small>Assets</small></div>
              <div className="metric-card"><span>{data.nominees.length}</span><small>Nominees</small></div>
              <div className="metric-card"><span>{verifiedCount}</span><small>Verified</small></div>
              <div className="metric-card"><span>{autoDebits}</span><small>Auto-debits</small></div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div>
              <div className="subheading">Mapped Assets</div>
              <div className="card-list">
                {data.assets.map((asset) => (
                  <AssetCard asset={asset} nominees={data.nominees} key={asset.id} />
                ))}
                {!data.assets.length && !loading && <div className="empty-state">No assets added yet.</div>}
              </div>
            </div>
            <div>
              <div className="subheading">Nominee Verification</div>
              <div className="card-list">
                {data.nominees.map((nominee) => (
                  <NomineeCard nominee={nominee} key={nominee.id} onVerify={verifyNominee} />
                ))}
                {!data.nominees.length && !loading && <div className="empty-state">No nominees added yet.</div>}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function GriefPage({ showToast }) {
  const { data, reload } = useDashboardSnapshot(showToast);
  const [triggerType, setTriggerType] = useState("death");
  const [otpContact, setOtpContact] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSessionId, setOtpSessionId] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [certificateNumber, setCertificateNumber] = useState("");
  const [certificateIssuer, setCertificateIssuer] = useState("");
  const [checklistData, setChecklistData] = useState({ checklist: [], message: "Generate the checklist to show next steps." });
  const [language, setLanguage] = useState("en");
  const [claimantName, setClaimantName] = useState("");
  const [claimantRelation, setClaimantRelation] = useState("");
  const [assistant, setAssistant] = useState(null);
  const firstAidRef = useRef(null);

  const verifiedCount = useMemo(
    () => data.nominees.filter((nominee) => nominee.verificationStatus === "verified").length,
    [data.nominees]
  );

  const isVerified = Boolean(data.emergencyVerification?.verified);

  useEffect(() => {
    if (data.emergencyVerification?.triggerType) {
      setTriggerType(data.emergencyVerification.triggerType);
    }
  }, [data.emergencyVerification]);

  const requestOtp = async () => {
    try {
      const response = await fetchJson("/request-emergency-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: otpContact,
          triggerType,
        }),
      });

      setOtpSessionId(response.otpSessionId || "");
      setOtpVerified(false);
      if (response.demoOtp) {
        setOtpCode(response.demoOtp);
      }
      showToast(`${response.message || "OTP sent."} Demo OTP: ${response.demoOtp || "N/A"}`);
    } catch (error) {
      showToast(error.message || "Unable to request OTP.");
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await fetchJson("/verify-emergency-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otpSessionId,
          otp: otpCode,
        }),
      });

      setOtpVerified(Boolean(response.verified));
      showToast(response.message || "OTP verified.");
    } catch (error) {
      setOtpVerified(false);
      showToast(error.message || "OTP verification failed.");
    }
  };

  const verifyEmergency = async () => {
    try {
      const response = await fetchJson("/verify-emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggerType,
          otpSessionId,
          certificateNumber,
          issuer: certificateIssuer,
        }),
      });
      showToast(response.message || "Event verified.");
      await reload();
    } catch (error) {
      showToast(error.message || "Unable to verify event.");
    }
  };

  const generateChecklist = async () => {
    try {
      const response = await fetchJson("/generate-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ triggerType }),
      });
      setChecklistData({
        checklist: response.checklist || [],
        message: `${response.message} Verified nominees: ${response.verifiedNominees}/${response.nomineeCount}.`,
      });
      showToast("Financial First Aid Kit ready.");
      if (firstAidRef.current) {
        firstAidRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (error) {
      showToast(error.message || "Unable to generate checklist.");
    }
  };

  const generateAssistant = async () => {
    try {
      const response = await fetchJson("/recovery-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ triggerType, language, claimantName, claimantRelation }),
      });
      setAssistant(response.recoveryAssistant);
      showToast("Recovery assistant ready.");
    } catch (error) {
      showToast(error.message || "Unable to generate assistant.");
    }
  };

  const downloadText = (subject, body) => {
    const filename = `${String(subject || "letter").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Letter downloaded as TXT.");
  };

  const printPdf = (subject, body) => {
    const popup = window.open("", "_blank", "width=860,height=760");
    if (!popup) {
      showToast("Popup blocked. Allow popups to export PDF.");
      return;
    }
    popup.document.write(`<!doctype html><html><head><meta charset=\"utf-8\" /><title>${subject}</title><style>body{font-family:Segoe UI,Arial,sans-serif;margin:24px;line-height:1.5;}h1{font-size:20px;}pre{white-space:pre-wrap;font-family:inherit;}</style></head><body><h1>${subject}</h1><pre>${body}</pre></body></html>`);
    popup.document.close();
    popup.focus();
    popup.print();
    showToast("Print dialog opened. Choose Save as PDF.");
  };

  const copyLetter = async (body) => {
    try {
      await navigator.clipboard.writeText(body);
      showToast("Letter copied to clipboard.");
    } catch (_error) {
      showToast("Clipboard access denied. Copy manually.");
    }
  };

  return (
    <>
      <header className="page-header grief-header">
        <div>
          <p className="eyebrow warning">Family Flow</p>
          <h1>Simple steps for a family member</h1>
          <p className="hero-copy">Verify the event, unlock approved access, and follow the financial first aid kit.</p>
        </div>
      </header>

      <main className="stack-layout">
        <section className="panel">
          <div className="overview-grid">
            <div className="spot-card"><small>Step 1</small><strong>Verify the event</strong><p>Confirm death or disability before protected access is released.</p></div>
            <div className="spot-card"><small>Step 2</small><strong>See who is approved</strong><p>Only verified family members should appear in the access list.</p></div>
            <div className="spot-card"><small>Step 3</small><strong>Follow the first aid kit</strong><p>DAAYAM lists exactly what to claim, cancel, and transfer.</p></div>
          </div>
        </section>

        <section className="panel">
          <p className="kicker">Step 1</p>
          <h2>Verify death or disability</h2>
          <div className="form-grid certificate-grid">
            <label>OTP Contact (mobile/email)<input value={otpContact} onChange={(event) => setOtpContact(event.target.value)} type="text" placeholder="Nominee phone or email" /></label>
            <label>Enter OTP<input value={otpCode} onChange={(event) => setOtpCode(event.target.value)} type="text" placeholder="6-digit OTP" /></label>
            <label>Certificate Number<input value={certificateNumber} onChange={(event) => setCertificateNumber(event.target.value)} type="text" placeholder="Enter death or disability certificate number" /></label>
            <label>Issuing Authority<input value={certificateIssuer} onChange={(event) => setCertificateIssuer(event.target.value)} type="text" placeholder="Hospital, municipal office, or government authority" /></label>
          </div>
          <div className="flow-actions">
            <select className="trigger-select" value={triggerType} onChange={(event) => setTriggerType(event.target.value)}>
              <option value="death">Death</option>
              <option value="disability">Disability</option>
            </select>
            <button className="secondary-btn" type="button" onClick={requestOtp}>Request OTP</button>
            <button className="secondary-btn" type="button" disabled={!otpSessionId || !otpCode} onClick={verifyOtp}>Verify OTP</button>
            <button className="secondary-btn" type="button" disabled={!otpVerified} onClick={verifyEmergency}>Verify Event</button>
            <button className="danger-btn" type="button" disabled={!isVerified} onClick={generateChecklist}>Generate First Aid Kit</button>
          </div>
          <div className="release-status-grid">
            <div className="status-box"><small>Vault status</small><strong>{data.familyAccess?.vaultStatus === "released" ? "Released" : "Protected"}</strong></div>
            <div className="status-box"><small>Approved family</small><strong>{data.guardians.length}</strong></div>
            <div className="status-box"><small>OTP status</small><strong>{otpVerified ? "Verified" : "Pending"}</strong></div>
            <div className="status-box"><small>Immediate risks</small><strong>{checklistData.checklist.length}</strong></div>
          </div>
          <p className="support-text">{data.familyAccess?.releaseSummary || "Vault remains protected until death or disability is verified."}</p>
        </section>

        <section className="panel">
          <div className="section-title split">
            <div>
              <p className="kicker">Access</p>
              <h2>Who can view the vault</h2>
            </div>
            <div className="metric-row">
              <div className="metric-card compact-metric"><span>{data.readinessScore || 0}%</span><small>Protection</small></div>
              <div className="metric-card compact-metric"><span>{data.assets.length}</span><small>Assets</small></div>
              <div className="metric-card compact-metric"><span>{data.nominees.length}</span><small>Nominees</small></div>
              <div className="metric-card compact-metric"><span>{verifiedCount}</span><small>Verified</small></div>
              <div className="metric-card compact-metric"><span>{data.assets.filter((asset) => asset.autoDebit).length}</span><small>Auto-debits</small></div>
            </div>
          </div>
          <div className="family-access-list">
            {data.guardians.map((guardian) => (
              <div className="access-chip" key={guardian.id}>
                <strong>{guardian.name}</strong>
                <span>{guardian.relation} | {guardian.releaseStatus}</span>
              </div>
            ))}
            {!data.guardians.length && <div className="empty-state">No approved family member yet.</div>}
          </div>
          <div className="mini-grid">
            {(data.insights || []).map((insight) => (
              <div className="mini-card" key={createId()}>
                <small>{insight.label}</small>
                <strong>{insight.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel emergency-panel" ref={firstAidRef}>
          <p className="kicker warning">Step 2</p>
          <h2>Financial First Aid Kit</h2>
          <p className="support-text">{checklistData.message}</p>
          <div className="checklist-grid">
            {checklistData.checklist.map((entry, index) => {
              const category = getTypeMeta(entry.category);
              return (
                <article className="check-item" key={entry.id || `${entry.title}-${index}`}>
                  <div className="check-icon">{index + 1}</div>
                  <div>
                    <div className="tag-row">
                      <span className="pill">{category.label}</span>
                      <span className={`priority-pill ${String(entry.priority || "high").toLowerCase()}`}>{entry.priority || "High"}</span>
                    </div>
                    <strong>{entry.title}</strong>
                    <p className="subtext">{entry.note}</p>
                    <div className="inline-detail">Institution: {entry.institution || "DAAYAM Vault"}</div>
                    {entry.link && (
                      <a className="action-link" href={entry.link} target="_blank" rel="noreferrer">
                        {entry.actionLabel || "Open guidance"}
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
            {!checklistData.checklist.length && <div className="empty-state">Generate the checklist to see the ordered action plan.</div>}
          </div>
        </section>

        <section className="panel">
          <p className="kicker">Step 3</p>
          <h2>AI Recovery Assistant</h2>
          <p className="support-text">
            Tell the family exactly what to claim, what to cancel, and deadlines to hit. Auto-generate plain letters in English, Tamil, or Hindi.
          </p>
          <div className="form-grid recovery-grid">
            <label>Letter language
              <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
              </select>
            </label>
            <label>Claimant name<input value={claimantName} onChange={(event) => setClaimantName(event.target.value)} type="text" placeholder="Family member submitting claims" /></label>
            <label>Claimant relation<input value={claimantRelation} onChange={(event) => setClaimantRelation(event.target.value)} type="text" placeholder="Spouse, Son, Daughter, Brother" /></label>
            <div className="assistant-action-wrap">
              <button type="button" className="primary-btn" disabled={!isVerified} onClick={generateAssistant}>Generate Recovery Assistant</button>
            </div>
          </div>

          <div className="assistant-summary">{assistant?.summary || "Generate the assistant after event verification."}</div>
          <div className="checklist-grid">
            {(assistant?.tasks || []).map((task, index) => (
              <article className="check-item" key={task.id || `${task.title}-${index}`}>
                <div className="check-icon">{index + 1}</div>
                <div>
                  <div className="tag-row">
                    <span className="pill">{getTypeMeta(task.category).label}</span>
                    <span className={`priority-pill ${String(task.priority || "high").toLowerCase()}`}>{task.priority}</span>
                  </div>
                  <strong>{task.title}</strong>
                  <p className="subtext">{task.note}</p>
                  <div className="inline-detail">{assistant?.deadlinePrefix || "Target date"}: {formatDate(task.deadlineDate)}</div>
                  <div className="inline-detail">Institution: {task.institution || "DAAYAM Vault"}</div>
                </div>
              </article>
            ))}
          </div>

          <div className="card-list">
            {(assistant?.letters || []).map((letter, index) => (
              <article className="letter-card" key={letter.id || `${letter.subject}-${index}`}>
                <div className="letter-head">
                  <div>
                    <strong>{letter.institution || "Institution"}</strong>
                    <div className="inline-detail">{letter.subject}</div>
                  </div>
                  <div className="letter-action-row">
                    <button className="secondary-btn copy-letter-btn" type="button" onClick={() => copyLetter(letter.body)}>Copy</button>
                    <button className="secondary-btn copy-letter-btn" type="button" onClick={() => downloadText(letter.subject, letter.body)}>TXT</button>
                    <button className="secondary-btn copy-letter-btn" type="button" onClick={() => printPdf(letter.subject, letter.body)}>PDF</button>
                    <button className="secondary-btn copy-letter-btn" type="button" onClick={() => (window.location.href = `mailto:?subject=${encodeURIComponent(letter.subject)}&body=${encodeURIComponent(letter.body)}`)}>Email</button>
                    <button className="secondary-btn copy-letter-btn" type="button" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${letter.subject}\n\n${letter.body}`)}`, "_blank", "noopener,noreferrer")}>WhatsApp</button>
                  </div>
                </div>
                <pre className="letter-body">{letter.body}</pre>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function App() {
  const { showToast, toastNode } = useToast();

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage showToast={showToast} />} />
        <Route path="/assets" element={<AssetsPage showToast={showToast} />} />
        <Route path="/nominees" element={<NomineesPage showToast={showToast} />} />
        <Route path="/manage" element={<ManagePage showToast={showToast} />} />
        <Route path="/grief" element={<GriefPage showToast={showToast} />} />

        <Route path="/dashboard.html" element={<Navigate to="/dashboard" replace />} />
        <Route path="/assets.html" element={<Navigate to="/assets" replace />} />
        <Route path="/nominees.html" element={<Navigate to="/nominees" replace />} />
        <Route path="/manage.html" element={<Navigate to="/manage" replace />} />
        <Route path="/grief.html" element={<Navigate to="/grief" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {toastNode}
    </AppLayout>
  );
}

export default App;
