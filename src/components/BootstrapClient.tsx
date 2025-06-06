// src/components/BootstrapClient.tsx
'use client';

import { useEffect } from 'react';

export default function BootstrapClient() {
  useEffect(() => {
    import('bootstrap/js/dist/collapse');
    import('bootstrap/js/dist/dropdown');
    import('bootstrap/js/dist/alert');
    import('bootstrap/js/dist/base-component');
    import('bootstrap/js/dist/button');
    import('bootstrap/js/dist/carousel');
    import('bootstrap/js/dist/modal');
    import('bootstrap/js/dist/offcanvas');
    import('bootstrap/js/dist/popover');
    import('bootstrap/js/dist/scrollspy');
    import('bootstrap/js/dist/tab');
    import('bootstrap/js/dist/toast');
    import('bootstrap/js/dist/tooltip');
  }, []);

  return null;
}