import { ButtonLink, type ButtonLinkProps } from './ButtonLink';

export type PrimaryButtonProps = Omit<ButtonLinkProps, 'variant'>;

/** Primary call-to-action (inverse fill). Thin wrapper around ButtonLink. */
export function PrimaryButton(props: PrimaryButtonProps) {
    return <ButtonLink {...props} variant="primary" />;
}
