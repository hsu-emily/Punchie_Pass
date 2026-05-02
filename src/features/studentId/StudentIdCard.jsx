/**
 * StudentIdCard — the shareable, framed bunny ID card.
 *
 * Composes the user's HumanAvatar inside a chosen border, alongside a
 * decorative QR placeholder, name, total punches, and streak. Use the
 * real QR as a child via the `qr` slot when generating server-side.
 *
 * @param {Object} props
 * @param {string} props.bunnyName
 * @param {Object} props.avatar          — see HumanAvatar
 * @param {string} props.borderUrl       — full URL to the chosen border PNG
 * @param {number} props.totalPunches
 * @param {number} props.streakDays
 * @param {string} [props.idNumber]      — defaults to a derived label
 * @param {React.ReactNode} [props.qr]   — optional QR component slot
 */
import React from 'react';
import HumanAvatar from '@/features/avatar/HumanAvatar.jsx';
import PlaceholderQR from '@/features/studentId/PlaceholderQR.jsx';

export default function StudentIdCard({
  bunnyName,
  avatar,
  borderUrl,
  totalPunches = 0,
  streakDays = 0,
  idNumber,
  qr,
}) {
  return (
    <div className="pp-id-card">
      <div className="pp-id-qr">{qr ?? <PlaceholderQR />}</div>

      <div className="pp-id-photo-frame">
        {borderUrl && <img className="pp-id-border" src={borderUrl} alt="" />}
        <div className="pp-id-photo">
          <HumanAvatar avatar={avatar} size={110} />
        </div>
      </div>

      <div className="pp-id-info">
        <div className="pp-id-stamp">PUNCHIE PASS · STUDENT ID</div>
        <div className="pp-id-name">{bunnyName || 'Bunny'}</div>
        <div className="pp-id-meta">
          <span className="pp-pill">EST {new Date().getFullYear()}</span>
          <span className="pp-pill">★ {totalPunches}</span>
          {streakDays > 0 && <span className="pp-pill">{streakDays}-day 🔥</span>}
        </div>
      </div>

      <div className="pp-id-watermark">// {idNumber || 'PP-0042'}</div>
    </div>
  );
}
