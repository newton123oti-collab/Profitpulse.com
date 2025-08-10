// src/pages/AuthCallback.js
import React, { useEffect, useState } from 'react';
import { APP_ID } from '../config';

export default function AuthCallback(){
  const [state, setState] = useState({ status:'verifying', data:null, error:null });

  useEffect(()=>{
    const parseParams = () => {
      const url = window.location.href;
      // Deriv may return tokens in hash (#) or query (?); handle both
      const part = url.includes('#') ? url.split('#')[1] : (url.includes('?') ? url.split('?')[1] : '');
      const params = new URLSearchParams(part);
      const out = {};
      for (const [k,v] of params.entries()) out[k]=v;
      return out;
    };

    const params = parseParams();
    if (!params || Object.keys(params).length === 0) {
      setState({ status:'error', error:'No tokens found in the redirect URL. Ensure the redirect URL is registered in your Deriv app.' });
      return;
    }
    setState({ status:'found', data:params });

    // Try to find a usable token field
    const token = params.session_token || params.access_token || params.token || params.authorize;
    if (!token) { setState({ status:'done', data: params }); return; }

    // Attempt a short WebSocket authorize to prove the token works (demo only)
    try {
      const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`);
      ws.onopen = () => ws.send(JSON.stringify({ authorize: token }));
      const handler = (msg) => {
        try {
          const d = JSON.parse(msg.data);
          if (d.authorize) {
            setState({ status:'authorized', data: d.authorize });
            ws.removeEventListener('message', handler);
            ws.close();
          } else if (d.error) {
            setState({ status:'error', error: d.error });
            ws.removeEventListener('message', handler);
            ws.close();
          }
        } catch(e) {
          setState({ status:'error', error: e.toString() });
        }
      };
      ws.addEventListener('message', handler);
    } catch(e) {
      setState({ status:'error', error: e.toString() });
    }
  },[]);

  return (
    <div style={{maxWidth:980,margin:'36px auto',padding:20}}>
      <h2>Deriv Sign-in callback</h2>

      {state.status === 'verifying' && <p>Verifying sign-in...</p>}

      {state.status === 'found' && (
        <div>
          <p>Parameters found in redirect — attempting verification...</p>
          <pre style={{background:'#f4f4f4',padding:12}}>{JSON.stringify(state.data,null,2)}</pre>
        </div>
      )}

      {state.status === 'authorized' && (
        <div>
          <p style={{color:'lime'}}>Authorization successful — session verified.</p>
          <div style={{background:'#0b1220',padding:12,borderRadius:8,color:'#cfeefb'}}>
            <pre>{JSON.stringify(state.data,null,2)}</pre>
          </div>
          <p style={{marginTop:12}}>Return to <a href="/dashboard">Dashboard</a>.</p>
        </div>
      )}

      {state.status === 'done' && (
        <div>
          <p>Redirect parameters (no direct token to authorize client-side):</p>
          <pre style={{background:'#f4f4f4',padding:12}}>{JSON.stringify(state.data,null,2)}</pre>
          <p>If you expected a token here, check your Deriv app type (server flow vs implicit flow) and redirect registration.</p>
        </div>
      )}

      {state.status === 'error' && (
        <div>
          <p style={{color:'#ff7b7b'}}>Error verifying sign-in:</p>
          <pre style={{background:'#fff1f1',padding:12}}>{JSON.stringify(state.error,null,2)}</pre>
        </div>
      )}
    </div>
  );
        }
