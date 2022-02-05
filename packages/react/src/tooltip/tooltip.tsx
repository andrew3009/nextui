import React, { useEffect, useRef, useState } from 'react';
import withDefaults from '../utils/with-defaults';
import TooltipContent from './tooltip-content';
import useClickAway from '../use-click-away';
import { Placement } from '../utils/prop-types';
import { CSS } from '../theme/stitches.config';
import { TriggerTypes } from '../utils/prop-types';
import { TooltipContentProps } from './tooltip-content';
import {
  StyledTooltipTrigger,
  TooltipContentVariantsProps
} from './tooltip.styles';
// import './test.css';

export type TooltipOnVisibleChange = (visible: boolean) => void;

interface Props {
  content: string | React.ReactNode;
  placement?: Placement;
  visible?: boolean;
  shadow?: boolean;
  rounded?: boolean;
  initialVisible?: boolean;
  animated?: boolean;
  hideArrow?: boolean;
  trigger?: TriggerTypes;
  enterDelay?: number;
  leaveDelay?: number;
  offset?: number;
  className?: string;
  keepMounted?: boolean;
  portalClassName?: string;
  onClick?: () => void;
  onVisibleChange?: TooltipOnVisibleChange;
  as?: keyof JSX.IntrinsicElements;
  triggerCss?: CSS;
}

const defaultProps = {
  initialVisible: false,
  hideArrow: false,
  animated: true,
  shadow: true,
  rounded: false,
  keepMounted: false,
  trigger: 'hover' as TriggerTypes,
  enterDelay: 0,
  leaveDelay: 0,
  className: '',
  portalClassName: '',
  onVisibleChange: (() => { }) as TooltipOnVisibleChange
};

type NativeAttrs = Omit<React.HTMLAttributes<any>, keyof Props>;

export type TooltipProps = Props &
  typeof defaultProps &
  NativeAttrs &
  Pick<TooltipContentVariantsProps, 'color' | 'contentColor'> &
  Pick<TooltipContentProps, 'css'>;

const Tooltip: React.FC<React.PropsWithChildren<TooltipProps>> = ({
  children,
  initialVisible,
  content,
  offset,
  placement,
  portalClassName,
  enterDelay,
  leaveDelay,
  trigger,
  rounded,
  animated,
  shadow,
  className,
  color,
  contentColor,
  onVisibleChange,
  hideArrow,
  css,
  triggerCss,
  onClick,
  keepMounted,
  visible: customVisible,
  ...props
}) => {
  const timer = useRef<number>();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<boolean>(initialVisible);

  const contentProps = {
    animated,
    visible,
    css,
    shadow,
    offset,
    placement,
    rounded,
    color,
    contentColor,
    hideArrow,
    parent: ref,
    className: portalClassName
  };

  const changeVisible = (nextState: boolean) => {
    const clear = () => {
      clearTimeout(timer.current);
      timer.current = undefined;
    };
    const handler = (nextState: boolean) => {
      setVisible(nextState);
      onVisibleChange(nextState);
      clear();
    };
    clear();
    if (nextState) {
      timer.current = window.setTimeout(() => handler(true), enterDelay);
      return;
    }
    timer.current = window.setTimeout(() => handler(false), leaveDelay);
  };

  // const mouseEventHandler = (next: boolean) => {
  //   trigger === 'hover' && changeVisible(next);
  // };

  // const clickEventHandler = () => {
  //   trigger === 'click' && changeVisible(!visible);
  //   onClick?.();
  // };

  useClickAway(
    ref,
    () => trigger === 'click' && !keepMounted && changeVisible(false)
  );

  useEffect(() => {
    if (customVisible === undefined) return;
    changeVisible(customVisible);
  }, [customVisible]);

  // [data] { // Trigger CSS
  //   position: relative;
  //   border: 1px dashed #000;
  //   cursor: help;
  // }

  // [data]::after { // Tooltip Content
  //   position: absolute;
  //   opacity: 0;
  //   pointer-events: none;
  //   content: attr(data);
  //   top: auto;
  //   right: auto;
  //   left: 0;
  //   bottom: calc(100% + 10px);
  //   border-radius: 3px;
  //   /* box-shadow: 0 0 5px 2px rgba(100, 100, 100, 0.6); */
  //   background-color: black;
  //   z-index: 10;
  //   padding: 0 10px;
  //   width: auto;
  //   /* transform: translateY(-20px); */
  //   transform: translate(0%, 10%);
  //   transition: all 150ms cubic-bezier(0.25, 0.8, 0.25, 1);
  // }

  // [data]:hover::after { // Tooltip Content Active
  //   opacity: 1;
  //   transform: translateY(0);
  //   transition-duration: 300ms;
  // }

  const styles = {
    position: 'relative',
    border: '1px dashed #000',
    cursor: 'help',
    ...triggerCss,
    '::after': {
      position: 'absolute',
      opacity: 0,
      pointerEvents: 'none',
      content: `attr(${content})`,
      top: 'auto',
      right: 'auto',
      left: 0,
      bottom: 'calc(100% + 10px)',
      borderRadius: '3px',
      boxShadow: '0 0 5px 2px rgba(100, 100, 100, 0.6)',
      backgroundColor: 'black',
      zIndex: 10,
      padding: '0 10px',
      width: 'auto',
      transform: 'translate(0%, 10%)',
      transition: 'all 150ms cubic-bezier(0.25, 0.8, 0.25, 1)'
    },
    ':hover::after': {
      opacity: 1,
      transform: 'translateY(0)',
      transitionDuration: '300ms',
      pointerEvents: 'auto'
    }
  };

  return (
    <>
      {React.Children.map(children, (child: React.ReactElement) => {
        const childProps = {
          ...child.props,
          ...props,
          // onMouseEnter: () => mouseEventHandler(true),
          // onMouseLeave: () => mouseEventHandler(false),
          // onClick: () => clickEventHandler(),
          data: content,
          style: {
            ...styles,
          }
        };
        return React.cloneElement(child, childProps);
      })}
      {/* <StyledTooltipTrigger
        ref={ref}
        onClick={clickEventHandler}
        onMouseEnter={() => mouseEventHandler(true)}
        onMouseLeave={() => mouseEventHandler(false)}
        css={{
          ...(triggerCss as any)
        }}
        {...props}
      >
        <TooltipContent {...contentProps}>{content}</TooltipContent>
      </StyledTooltipTrigger> */}
    </>
  );
}

Tooltip.toString = () => '.nextui-tooltip';

export default withDefaults(Tooltip, defaultProps);
