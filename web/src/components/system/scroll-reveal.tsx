'use client';

import { useEffect } from 'react';

const selector = '.animate-fade-in-on-scroll, .animate-light-on-scroll';
const readyClass = 'scroll-reveal-ready';

export function ScrollReveal() {
  useEffect(() => {
    let cleanup = () => {};
    let animationFrame = 0;
    let timeout = 0;

    const startReveal = () => {
      animationFrame = window.requestAnimationFrame(() => {
        timeout = window.setTimeout(() => {
          if (!('IntersectionObserver' in window)) {
            document
              .querySelectorAll<HTMLElement>(selector)
              .forEach((element) => element.classList.add('is-visible'));
            document.body.classList.add(readyClass);
            cleanup = () => document.body.classList.remove(readyClass);
            return;
          }

          const observedElements = new WeakSet<Element>();

          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                entry.target.classList.toggle(
                  'is-visible',
                  entry.isIntersecting,
                );
              });
            },
            {
              threshold: 0,
              rootMargin: '-10% 0px -10% 0px',
            },
          );

          const observeElement = (element: Element) => {
            if (observedElements.has(element)) {
              return;
            }

            observedElements.add(element);
            observer.observe(element);
          };

          const observeElements = (root: ParentNode = document) => {
            root
              .querySelectorAll<HTMLElement>(selector)
              .forEach((element) => observeElement(element));
          };

          observeElements();
          document.body.classList.add(readyClass);

          const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (!(node instanceof Element)) {
                  return;
                }

                if (node.matches(selector)) {
                  observeElement(node);
                }

                observeElements(node);
              });
            });
          });

          mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
          });

          cleanup = () => {
            observer.disconnect();
            mutationObserver.disconnect();
            document.body.classList.remove(readyClass);
          };
        }, 0);
      });
    };

    if (document.readyState === 'complete') {
      startReveal();
    } else {
      window.addEventListener('load', startReveal, { once: true });
    }

    return () => {
      window.removeEventListener('load', startReveal);
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(timeout);
      cleanup();
    };
  }, []);

  return null;
}
