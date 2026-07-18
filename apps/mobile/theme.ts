import { haloCorners, palette, radii, shadows } from '@pawlie/tokens';
import { Appearance, Platform, type ViewStyle } from 'react-native';

export function useTheme() {
  const mode = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  return { colors: palette[mode], mode } as const;
}

export const cardRadius = radii.card;
export const pillRadius = radii.pill;

export const haloStyle: ViewStyle = {
  borderTopLeftRadius: haloCorners.topLeft,
  borderTopRightRadius: haloCorners.topRight,
  borderBottomRightRadius: haloCorners.bottomRight,
  borderBottomLeftRadius: haloCorners.bottomLeft,
  alignItems: 'center',
  justifyContent: 'center',
};

export const softShadow: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: '#1F2A1A',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  default: { elevation: 6 },
});

export { shadows };
