// src/components/Navbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { APP_ID, AFFILIATE_TOKEN, OAUTH_REDIRECT_URI } from '../config';

export default function Navbar(){
  const loc = useLocation();
  const isActive = (p) => loc.pathname === p ? { color:'#fff', background:'rgba(255,255,255,0.03)', padding:8, borderRadius:8 } : {};

  // Builds the Deriv OAuth URL. Users will be redirected back to OAUTH_REDIRECT_URI after login.
  const getDerivOauthUrl = () => {
    const base = 'https://oauth.deriv.com/oauth2/authorize';
    const params = new URLSearchParams({
      app_id: APP_ID,
      redirect_uri: OAUTH_REDIRECT_URI,
      l: 'en' // language
      // add scope or other params if Deriv requires them
    });
    return `${base}?${params.toString()}`;
  };

  // Affiliate signup URL using your affiliate token
  const signupUrl = `https://hub.deriv.com/tradershub/signup?t=${encodeURIComponent(AFFILIATE_TOKEN)}&utm_campaign=profitpulse`;

  return (
    <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:12}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{fontWeight:800,color:'#06b6d4'}}>ProfitPulse</div>
        <div style={{color:'#94a3b8'}}>Deriv-style demo</div>
      </div>

      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        <Link to="/" style={isActive('/')}>Home</Link>
        <Link to="/trading" style={isActive('/trading')}>Trading</Link>
        <Link to="/bots" style={isActive('/bots')}>Bot Builder</Link>
        <Link to="/affiliate" style={isActive('/affiliate')}>Affiliate</Link>

        {/* Sign in (OAuth) */}
        <button
          onClick={() => { window.location.href = getDerivOauthUrl(); }}
          style={{padding:'8px 12px',borderRadius:8,background:'#06b6d4',border:'none',cursor:'pointer'}}
        >
          Sign in with Deriv
        </button>

        {/* Sign up / referral using your affiliate token */}
        <a
          href={signupUrl}
          target="_blank"
          rel="noreferrer"
          style={{padding:'8px 12px',borderRadius:8,background:'#7c3aed',color:'#fff',textDecoration:'none'}}
        >
          Sign up (Referrals)
        </a>
      </div>
    </nav>
  );
  }
