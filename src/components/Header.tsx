'use client';
import Link from 'next/link';
import { useState } from 'react';
import { CurrencySelect } from './Currency';

export default function Header() {
  const [open, setOpen] = useState(false);
  const toggleTheme = () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
  };
  const close = () => setOpen(false);
  return (
    <header className={`bleed${open ? ' open' : ''}`} id="hd">
      <div className="nav">
        <ul className="l">
          <li><Link className="nl" href="/#sale">Yachts for sale</Link></li>
          <li><Link className="nl" href="/#charter">Charter</Link></li>
          <li><Link className="nl" href="/#destinations">Destinations</Link></li>
        </ul>
        <Link className="logo" href="/">Blackpearl</Link>
        <div className="r">
          <ul>
            <li><Link className="nl" href="/#journal">Journal</Link></li>
            <li><Link className="nl" href="/#contact">Contact</Link></li>
          </ul>
          <CurrencySelect />
          <button className="ibtn" type="button" onClick={toggleTheme} aria-label="Switch colour theme">Light / Dark</button>
          <button className="ibtn" id="menu" type="button" aria-expanded={open} aria-controls="sheet" onClick={() => setOpen(!open)}>Menu</button>
        </div>
      </div>
      <div className="sheet" id="sheet">
        <Link href="/#sale" onClick={close}>Yachts for sale</Link><Link href="/#charter" onClick={close}>Charter</Link>
        <Link href="/#destinations" onClick={close}>Destinations</Link><Link href="/#journal" onClick={close}>Journal</Link><Link href="/#contact" onClick={close}>Contact</Link>
      </div>
    </header>
  );
}
