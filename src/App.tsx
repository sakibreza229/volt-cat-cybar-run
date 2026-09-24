/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameCanvas } from './components/GameCanvas';

export default function App() {
  return (
    <main className="fixed inset-0 w-full h-full bg-slate-950 text-slate-100 overflow-hidden select-none">
      <GameCanvas />
    </main>
  );
}

