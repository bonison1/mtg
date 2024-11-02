"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './EmployeeDashboard.module.css';

export default function EmployeeDashboard() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState('Team1');
  const [pickupName, setPickupName] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupPhone, setPickupPhone] = useState('');
  const [dropName, setDropName] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [dropPhone, setDropPhone] = useState('');
  const [orderType, setOrderType] = useState('Due');
  const [pb, setPB] = useState('Due');
  const [dc, setDC] = useState('Due');
  const [pbAmount, setPBAmount] = useState('');
  const [dcAmount, setDCAmount] = useState('');
  const [autoTSB, setAutoTSB] = useState<number>(0);
  const [autoCID, setAutoCID] = useState<number>(0);
  const [status, setStatus] = useState<string>('Pending');
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const formattedDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    calculateAutoValues();
  }, [dc, pb, pbAmount, dcAmount]);

  const calculateAutoValues = () => {
    const pbAmt = Number(pbAmount) || 0;
    const dcAmt = Number(dcAmount) || 0;
    let tsb = 0;
    let cid = 0;

    if (dc === "Due" && pb === "COD") {
      tsb = pbAmt - dcAmt;
      cid = pbAmt;
    } else if (dc === "Prepaid" && pb === "COD") {
      tsb = pbAmt;
      cid = pbAmt;
    } else if (dc === "COD" && pb === "COD") {
      tsb = pbAmt;
      cid = pbAmt + dcAmt;
    } else if (dc === "Due" && pb === "Prepaid") {
      tsb = pbAmt - dcAmt;
      cid = 0;
    } else if (dc === "Prepaid" && pb === "Prepaid") {
      tsb = 0;
      cid = 0;
    } else if (dc === "COD" && pb === "Prepaid") {
      tsb = 0;
      cid = dcAmt;
    } else if (dc === "Due" && pb === "Due") {
      tsb = -pbAmt - dcAmt;
      cid = 0;
    } else if (pb === "Prepaid" && dc === "Due") {
      tsb = -dcAmt;
    } else if (dc === "COD" && pb === "Due") {
      cid = dcAmt;
    }

    setAutoTSB(tsb);
    setAutoCID(cid);
  };

  const handleAddData = async () => {
    const employee = JSON.parse(sessionStorage.getItem('employee') || '{}');
    if (!employee || !employee.id) {
      setMessage('User not logged in');
      return;
    }

    try {
      const { error } = await supabase.from('order_data').insert({
        employee_id: employee.id,
        name,
        email,
        date: formattedDate,
        team,
        pickup_name: pickupName,
        pickup_address: pickupAddress,
        pickup_phone: pickupPhone,
        drop_name: dropName,
        drop_address: dropAddress,
        drop_phone: dropPhone,
        order_type: orderType,
        pb,
        dc,
        pb_amount: pbAmount,
        dc_amount: dcAmount,
        auto_tsb: autoTSB,
        auto_cid: autoCID,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) throw new Error(error.message);

      setMessage('Data added successfully');
      resetFormFields();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const resetFormFields = () => {
    setName('');
    setEmail('');
    setTeam('Team1');
    setPickupName('');
    setPickupAddress('');
    setPickupPhone('');
    setDropName('');
    setDropAddress('');
    setDropPhone('');
    setOrderType('Due');
    setPB('Due');
    setDC('Due');
    setPBAmount('');
    setDCAmount('');
    setAutoTSB(0);
    setAutoCID(0);
    setStatus('Pending');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('employee');
    router.push('/employee-login');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const employee = JSON.parse(sessionStorage.getItem('employee') || '{}');
      if (!employee || employee.role !== 'employee') {
        alert('Access denied: Employee only');
        router.push('/employee-login');
      }
    }
  }, [router]);

  return (
    <div className={styles.container}>
      <Header/>
      <button onClick={handleLogout} className={styles.button} style={{ width: '100%', marginBottom: '20px' }}>
        Logout
      </button>

      <main className={styles.mainContent}>
        <h1 className={styles.title}>Employee Dashboard</h1>

        <div className={styles.groupsRow}>
          {/* BASIC Details Group */}
          <div className={styles.groupContainer}>
            <div className={styles.groupTitle}>BASIC</div>
            <div className={styles.fieldGroup}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.formInput}
              />
              <label className={styles.floatingLabel}>Name</label>
            </div>
            <div className={styles.fieldGroup}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.formInput}
              />
              <label className={styles.floatingLabel}>Email</label>
            </div>
            <div className={styles.fieldGroup}>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className={styles.formSelect}
              >
                <option>Team1</option>
                <option>Team2</option>
                <option>Team3</option>
              </select>
              <label className={styles.floatingLabel}>Team</label>
            </div>
          </div>

          {/* Pickup Details Group */}
          <div className={styles.groupContainer}>
            <div className={styles.groupTitle}>PICKUP DETAILS</div>
            <div className={styles.fieldGroup}>
              <input
                type="text"
                placeholder="Pickup Name"
                value={pickupName}
                onChange={(e) => setPickupName(e.target.value)}
                className={styles.formInput}
              />
              <label className={styles.floatingLabel}>Pickup Name</label>
            </div>
            <div className={styles.fieldGroup}>
              <input
                type="text"
                placeholder="Pickup Address"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className={styles.formInput}
              />
              <label className={styles.floatingLabel}>Pickup Address</label>
            </div>
            <div className={styles.fieldGroup}>
              <input
                type="text"
                placeholder="Pickup Phone"
                value={pickupPhone}
                onChange={(e) => setPickupPhone(e.target.value)}
                className={styles.formInput}
              />
              <label className={styles.floatingLabel}>Pickup Phone</label>
            </div>
          </div>

          {/* Drop Details Group */}
          <div className={styles.groupContainer}>
            <div className={styles.groupTitle}>DROP DETAILS</div>
            <div className={styles.fieldGroup}>
              <input
                type="text"
                placeholder="Drop Name"
                value={dropName}
                onChange={(e) => setDropName(e.target.value)}
                className={styles.formInput}
              />
              <label className={styles.floatingLabel}>Drop Name</label>
            </div>
            <div className={styles.fieldGroup}>
              <input
                type="text"
                placeholder="Drop Address"
                value={dropAddress}
                onChange={(e) => setDropAddress(e.target.value)}
                className={styles.formInput}
              />
              <label className={styles.floatingLabel}>Drop Address</label>
            </div>
            <div className={styles.fieldGroup}>
              <input
                type="text"
                placeholder="Drop Phone"
                value={dropPhone}
                onChange={(e) => setDropPhone(e.target.value)}
                className={styles.formInput}
              />
              <label className={styles.floatingLabel}>Drop Phone</label>
            </div>
          </div>

          {/* Order Types Group */}
          <div className={styles.groupContainer}>
            <div className={styles.groupTitle}>ORDER TYPES</div>
            <div className={styles.fieldGroup}>
              <select
                value={pb}
                onChange={(e) => setPB(e.target.value)}
                className={styles.formSelect}
              >
                <option value="" disabled>Select PB</option>
                <option>Due</option>
                <option>Prepaid</option>
                <option>COD</option>
              </select>
              <label className={styles.floatingLabel}>PB</label>
            </div>
            <div className={styles.fieldGroup}>
              <select
                value={dc}
                onChange={(e) => setDC(e.target.value)}
                className={styles.formSelect}
              >
                <option value="" disabled>Select DC</option>
                <option>Due</option>
                <option>Prepaid</option>
                <option>COD</option>
              </select>
              <label className={styles.floatingLabel}>DC</label>
            </div>
            <div className={styles.fieldGroup}>
              <input
                type="number"
                placeholder="PB Amount"
                value={pbAmount}
                onChange={(e) => setPBAmount(e.target.value)}
                className={styles.formInput}
              />
              <label className={styles.floatingLabel}>PB Amount</label>
            </div>
            <div className={styles.fieldGroup}>
              <input
                type="number"
                placeholder="DC Amount"
                value={dcAmount}
                onChange={(e) => setDCAmount(e.target.value)}
                className={styles.formInput}
              />
              <label className={styles.floatingLabel}>DC Amount</label>
            </div>
          </div>

          {/* Auto Bill Adjustment Group */}
          <div className={styles.groupContainer}>
            <div className={styles.groupTitle}>AUTO BILL ADJUSTMENT</div>
            <div className={styles.fieldGroup}>
              <input
                type="number"
                placeholder="TSB"
                value={autoTSB}
                readOnly
                className={`${styles.formInput} ${styles.readOnlyInput}`}
              />
              <label className={styles.floatingLabel}>TSB</label>
            </div>
            <div className={styles.fieldGroup}>
              <input
                type="number"
                placeholder="CID"
                value={autoCID}
                readOnly
                className={`${styles.formInput} ${styles.readOnlyInput}`}
              />
              <label className={styles.floatingLabel}>CID</label>
            </div>
            <div className={styles.fieldGroup}>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={styles.formSelect}
              >
                <option>Pending</option>
                <option>Delivered {formattedDate}</option>
                <option>Out for Delivery {formattedDate}</option>
                <option>Returned {formattedDate}</option>
                <option>Canceled by Customer</option>
                <option>Failed</option>
                <option>Pre Order</option>
              </select>
              <label className={styles.floatingLabel}>Status</label>
            </div>
          </div>
        </div>

        <button onClick={handleAddData} className={styles.button}>Submit</button>
        {message && <p className={message.includes('successfully') ? styles.messageSuccess : styles.messageError}>{message}</p>}
      </main>
      <Footer />
    </div>
  );
}
