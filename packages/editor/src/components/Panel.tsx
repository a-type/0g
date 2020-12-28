import * as React from 'react';
import { styled } from '../stitches.config';
import { useSpring, animated } from '@react-spring/web';
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  Cross1Icon,
} from '@modulz/radix-icons';

export const PanelSurface = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
});

const PanelRoot = styled(animated.div, {
  minWidth: 200,
  backgroundColor: '$glass',
  border: `1px solid $black`,
  boxShadow: `inset 0 0 0 1px $white`,
  position: 'absolute',
  top: 0,
  bottom: 0,
  overflow: 'visible',
  pointerEvents: 'all',
  display: 'flex',
  flexDirection: 'column',
  padding: '$1',
});

const panelContext = React.createContext<{
  open: boolean;
  toggle: () => void;
  anchor: 'left' | 'right';
} | null>(null);

export type PanelProps = {
  children?: React.ReactNode;
  anchor: 'left' | 'right';
  open?: boolean;
  onClose?: () => void;
};

export function Panel({
  anchor,
  open: controlledOpen,
  onClose,
  ...rest
}: PanelProps) {
  const [open, setOpen] = React.useState(!!controlledOpen);
  React.useEffect(() => {
    if (controlledOpen === undefined) return;
    setOpen(!!controlledOpen);
  }, [controlledOpen]);
  const toggle = React.useCallback(() => {
    setOpen((cur) => {
      if (cur) onClose?.();
      return !cur;
    });
  }, [onClose]);

  const value = React.useMemo(
    () => ({
      toggle,
      open,
      anchor,
    }),
    [toggle, open, anchor],
  );

  const style = useSpring({
    x: anchor === 'left' ? (open ? '0%' : '-100%') : open ? '0%' : '100%',
    left: anchor === 'left' ? 0 : 'auto',
    right: anchor === 'left' ? 'auto' : 0,
  });

  return (
    <panelContext.Provider value={value}>
      <PanelRoot style={style} {...rest} />
    </panelContext.Provider>
  );
}

export const PanelContent = styled('div', {
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

const PanelToggleButton = styled('button', {
  border: 'none',
  borderRadius: '100%',
  padding: '$1',
  position: 'absolute',
  lineHeight: 0,

  variants: {
    anchor: {
      left: {
        left: 'calc(100% + 8px)',
      },
      right: {
        right: 'calc(100% + 8px)',
      },
    },
  },
});

export function PanelToggle({ children }: { children?: React.ReactNode }) {
  const ctx = React.useContext(panelContext);
  if (!ctx) throw new Error('Must be used inside Panel');
  const { toggle, anchor, open } = ctx;
  return (
    <PanelToggleButton onClick={toggle} anchor={anchor}>
      {children ?? <PanelToggleIcon anchor={anchor} open={open} />}
    </PanelToggleButton>
  );
}

function PanelToggleIcon({
  anchor,
  open,
}: {
  open: boolean;
  anchor: 'left' | 'right';
}) {
  if (anchor === 'left') {
    if (open) {
      return <Cross1Icon />;
    }
    return <DoubleArrowRightIcon />;
  } else {
    if (open) {
      return <Cross1Icon />;
    }
    return <DoubleArrowLeftIcon />;
  }
}

export const PanelHeader = styled('div', {
  paddingLeft: '$1',
  paddingRight: '$1',
  paddingTop: '$2',
  paddingBottom: '$2',
  width: '100%',
});
