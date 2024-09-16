import './style.css';
import ReactDOM from 'react-dom/client';
import App from './App';

export default defineContentScript({
  matches: ['*://*/*'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    console.log('content script injecting', ctx);
    const ui = await createShadowRootUi(ctx, {
      name: 'silo-ui',
      position: 'overlay',
      alignment: 'bottom-right',
      zIndex: 99999,
      anchor: 'body',
      append: 'first',
      onMount: container => {
        // Don't mount react app directly on <body>
        const wrapper = document.createElement('div');
        wrapper.className = '';
        container.append(wrapper);

        const root = ReactDOM.createRoot(wrapper);
        root.render(<App />);
        return { root, wrapper };
      },
      onRemove: elements => {
        elements?.root.unmount();
        elements?.wrapper.remove();
      },
    });

    ui.mount();
  },
});
