import { SummaryBlock } from '@/components/reflection/SummaryBlock';
import { REFLECTION_QUESTIONS } from '@/content/reflectionQuestions';
import styles from '../SelfReflectionPage.module.css';

export function ReflectionSummaryView({ answers }) {
  const answerMap = new Map((answers || []).map((item) => [item.questionId, item.answer ?? '']));

  return (
    <div className={styles.summaryList}>
      {REFLECTION_QUESTIONS.map((q) => (
        <SummaryBlock
          key={q.id}
          title={q.theme}
          content={answerMap.get(q.id) || ''}
          emptyText="Belum diisi"
        />
      ))}
    </div>
  );
}
