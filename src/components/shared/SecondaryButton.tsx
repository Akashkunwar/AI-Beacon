import { ButtonLink, type ButtonLinkProps } from './ButtonLink';

export type SecondaryButtonProps = Omit<ButtonLinkProps, 'variant'>;

/** Secondary call-to-action (outlined). Thin wrapper around ButtonLink. */
export function SecondaryButton(props: SecondaryButtonProps) {
    return <ButtonLink {...props} variant="secondary" />;
}
