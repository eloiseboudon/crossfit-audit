import InfoTooltip from './InfoTooltip';

export default function InfoLabel({
  label,
  details,
  labelClassName,
  wrapperClassName
}: {
  label: string;
  details: string;
  labelClassName?: string;
  wrapperClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${wrapperClassName ?? ''}`}>
      <span className={labelClassName}>{label}</span>
      <InfoTooltip label={label} details={details} />
    </div>
  );
}
