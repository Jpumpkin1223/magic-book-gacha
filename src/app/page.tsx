import GachaApp from '@/components/GachaApp';

export const metadata = {
  title: '마법 도감 가챠',
  description: '마법 도감을 펼쳐 캐릭터를 소환하세요',
};

export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center overflow-hidden">
      <GachaApp />
    </main>
  );
}
