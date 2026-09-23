import Image from 'next/image';
import Link from 'next/link';

type Props = {
	size?: number;
	name?: string;
};

export function LogoLink({ size = 190, name = 'Le 7.59' }: Props) {
	return (
		<Link
			href="/#hero"
			aria-label="Retour à l’accueil"
			className="group flex items-center gap-3.5 text-foreground"
			style={{ width: size, minHeight: 48 }}
		>
			<span className="relative size-12 shrink-0 overflow-hidden rounded-sm border border-heritage-gold/60 bg-heritage-ink">
				<Image
					src="/logo.png"
					alt=""
					fill
					sizes="48px"
					className="object-cover"
				/>
			</span>
			<span className="min-w-0">
				<span className="block truncate font-brand text-[1.35rem] font-semibold leading-none tracking-[-0.045em]">
					{name}
				</span>
				<span className="mt-1.5 block text-[0.52rem] font-bold uppercase tracking-[0.22em] text-accent">
					Terroir · Amitié · Transmission
				</span>
			</span>
		</Link>
	);
}
