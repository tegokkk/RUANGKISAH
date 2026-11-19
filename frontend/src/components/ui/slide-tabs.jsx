import { NAVIGATION_SPRING } from '@/config/motionConfig';
import { useLayoutEffect, useRef, useState } from 'react';
import { LazyMotion, m as Motion, useReducedMotion } from 'framer-motion';
import { matchPath, NavLink, useLocation } from 'react-router-dom';
import styles from './slide-tabs.module.css';

const loadMotionFeatures = () => import('./slide-tabs-motion.js').then((module) => module.default);

export function SlideTabs({ items, className = '', wrap = false }) {
  const { pathname } = useLocation();
  const listRef = useRef(null);
  const tabsRef = useRef([]);
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0, opacity: 0 });
  const reduceMotion = useReducedMotion();
  const selected = items.findIndex((item) =>
    item.to ? matchPath({ path: item.to, end: item.end ?? false }, pathname) : item.active
  );
  const highlighted = hovered ?? focused ?? selected;

  useLayoutEffect(() => {
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      const list = listRef.current;
      const tab = tabsRef.current[highlighted];
      const tabRect = tab?.getBoundingClientRect();
      const listRect = list?.getBoundingClientRect();
      const next =
        tabRect?.width && listRect
          ? {
              x: tabRect.left - listRect.left - list.clientLeft,
              y: tabRect.top - listRect.top - list.clientTop,
              width: tabRect.width,
              height: tabRect.height,
              opacity: 1,
            }
          : { x: 0, y: 0, width: 0, height: 0, opacity: 0 };
      setPosition((previous) =>
        previous.x === next.x &&
        previous.y === next.y &&
        previous.width === next.width &&
        previous.height === next.height &&
        previous.opacity === next.opacity
          ? previous
          : next
      );
    };
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (listRef.current) observer?.observe(listRef.current);
    tabsRef.current.forEach((tab) => tab && observer?.observe(tab));
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [highlighted, items]);

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <ul
        ref={listRef}
        className={[styles.list, wrap ? styles.wrap : '', className].join(' ')}
        onMouseLeave={() => setHovered(null)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(null);
        }}
      >
        {items.map((item, index) => {
          const controlProps = {
            ref: (element) => {
              tabsRef.current[index] = element;
            },
            className: styles.link,
            'data-highlighted': highlighted === index || undefined,
            onMouseEnter: () => setHovered(index),
            onFocus: () => setFocused(index),
          };
          return (
            <li className={styles.item} key={item.to || item.id}>
              {item.to ? (
                <NavLink {...controlProps} to={item.to} end={item.end}>
                  {item.label}
                </NavLink>
              ) : (
                <button {...controlProps} type="button" onClick={item.onClick}>
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
        <Motion.li
          role="presentation"
          aria-hidden="true"
          data-slide-cursor
          className={styles.cursor}
          initial={false}
          animate={position}
          transition={reduceMotion ? { duration: 0 } : NAVIGATION_SPRING}
        />
      </ul>
    </LazyMotion>
  );
}
