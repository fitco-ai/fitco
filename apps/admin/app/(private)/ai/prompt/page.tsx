import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { TopNav } from '@/components/top-nav';
import ComparePromptForm from './_components/compare-prompt-form';
import PromptForm from './_components/prompt-form';

export default function AiPromptPage() {
  return (
    <>
      <Header>
        <TopNav headings={[{ title: '프롬프트' }]} />
      </Header>
      <Main>
        <div className="space-y-6">
          <PromptForm />
          <ComparePromptForm />
          {/* <TestForm /> */}
        </div>
      </Main>
    </>
  );
}
