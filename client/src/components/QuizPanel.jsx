import { useMemo, useState } from 'react'

const emptyDraft = (questions) =>
  questions.reduce((acc, question) => {
    acc[question.id] = { selectedOptionIds: [], textAnswer: '', saved: false }
    return acc
  }, {})

const hasDraftAnswer = (question, answer) => {
  if (!question || !answer) return false
  return question.type === 'mcq'
    ? answer.selectedOptionIds.length > 0
    : answer.textAnswer.trim().length > 0
}

const hasReviewAnswer = (question, answer) => {
  if (!question || !answer) return false
  return question.type === 'mcq'
    ? (answer.selected_option_ids || []).length > 0
    : Boolean(answer.text_answer?.trim())
}

const normalizeId = (id) => String(id)

const optionId = (option, index) => normalizeId(option?.id ?? index)

const optionText = (option) => option?.text ?? option

const optionLetter = (index) => String.fromCharCode(65 + index)

const optionLabel = (index) => `Option ${optionLetter(index)}`

const ordinal = (number) => {
  const suffix = number % 100 >= 11 && number % 100 <= 13
    ? 'th'
    : { 1: 'st', 2: 'nd', 3: 'rd' }[number % 10] || 'th'
  return `${number}${suffix}`
}

function QuizPanel({ quiz, onSubmit }) {
  const [started, setStarted] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [showAttempts, setShowAttempts] = useState(false)
  const [selectedAttempt, setSelectedAttempt] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [draft, setDraft] = useState(() => emptyDraft(quiz?.questions || []))
  const [localSaved, setLocalSaved] = useState({})
  const [seen, setSeen] = useState({})
  const [markedReview, setMarkedReview] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const questions = quiz?.questions || []
  const attempts = quiz?.attempts || []
  const currentQuestion = questions[currentIndex]
  const activeAttempt = selectedAttempt || quiz?.latestAttempt || attempts[0] || null
  const reviewAnswers = useMemo(() => {
    const answers = activeAttempt?.QuizAnswers || []
    return new Map(answers.map((answer) => [answer.question_id, answer]))
  }, [activeAttempt])

  if (!quiz || questions.length === 0) return null

  const currentDraft = draft[currentQuestion.id] || { selectedOptionIds: [], textAnswer: '', saved: false }
  const reviewAnswer = reviewAnswers.get(currentQuestion.id)
  const currentOptions = currentQuestion.options || []
  const selectedReviewIds = (reviewAnswer?.selected_option_ids || []).map(normalizeId)
  const correctOptionIds = (currentQuestion.correct_option_ids || []).map(normalizeId)
  const answerLabels = (ids) => {
    const labels = ids
      .map((id) => currentOptions.findIndex((option, index) => optionId(option, index) === id))
      .filter((index) => index >= 0)
      .map(optionLetter)
    return labels.length > 0 ? labels.join(', ') : '-'
  }
  const hasAttempt = attempts.length > 0
  const totalMcq = questions.filter((question) => question.type === 'mcq').length
  const latestScore = activeAttempt?.score ?? 0
  const latestMaxScore = activeAttempt?.max_score ?? totalMcq

  const startFresh = () => {
    setDraft(emptyDraft(questions))
    setLocalSaved({})
    setSeen({ [questions[0]?.id]: true })
    setMarkedReview({})
    setReviewMode(false)
    setSelectedAttempt(null)
    setShowAttempts(false)
    setStarted(true)
    setCurrentIndex(0)
    setMessage('')
  }

  const reviewAttempt = (attempt) => {
    setSelectedAttempt(attempt)
    setReviewMode(true)
    setStarted(false)
    setShowAttempts(false)
    setCurrentIndex(0)
    setMessage('')
  }

  const openResults = () => {
    setReviewMode(false)
    setStarted(false)
    setSelectedAttempt(activeAttempt)
    setMessage('')
  }

  const goToQuestion = (index) => {
    const question = questions[index]
    if (!question) return
    setCurrentIndex(index)
    if (!reviewMode) setSeen((currentSeen) => ({ ...currentSeen, [question.id]: true }))
    setMessage('')
  }

  const goNext = () => {
    goToQuestion(Math.min(currentIndex + 1, questions.length - 1))
  }

  const isOptionSelected = (optionId) => {
    const id = normalizeId(optionId)
    if (reviewMode) return (reviewAnswer?.selected_option_ids || []).map(normalizeId).includes(id)
    return currentDraft.selectedOptionIds.map(normalizeId).includes(id)
  }

  const toggleOption = (optionId) => {
    if (reviewMode) return
    const id = normalizeId(optionId)
    const currentSelected = currentDraft.selectedOptionIds.map(normalizeId)
    const selected = currentSelected.includes(id)
      ? currentSelected.filter((selectedId) => selectedId !== id)
      : [...currentSelected, id]

    setDraft({
      ...draft,
      [currentQuestion.id]: { ...currentDraft, selectedOptionIds: selected, saved: false },
    })
  }

  const updateText = (textAnswer) => {
    if (reviewMode) return
    setDraft({
      ...draft,
      [currentQuestion.id]: { ...currentDraft, textAnswer, saved: false },
    })
  }

  const toggleMarkedReview = () => {
    if (reviewMode) return
    setMarkedReview({
      ...markedReview,
      [currentQuestion.id]: !markedReview[currentQuestion.id],
    })
  }

  const formatText = (command) => {
    const textarea = document.getElementById('quiz-subjective-answer')
    if (!textarea || reviewMode) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = currentDraft.textAnswer.substring(0, start)
    const selected = currentDraft.textAnswer.substring(start, end)
    const after = currentDraft.textAnswer.substring(end)
    let formatted = selected

    switch (command) {
      case 'bold':
        formatted = `**${selected || 'bold text'}**`
        break
      case 'italic':
        formatted = `*${selected || 'italic text'}*`
        break
      case 'underline':
        formatted = `<u>${selected || 'underline text'}</u>`
        break
      case 'strikethrough':
        formatted = `~~${selected || 'strikethrough'}~~`
        break
      default:
        break
    }

    const nextText = before + formatted + after
    setDraft({
      ...draft,
      [currentQuestion.id]: { ...currentDraft, textAnswer: nextText, saved: false },
    })
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = start + formatted.length
      textarea.selectionEnd = start + formatted.length
    }, 0)
  }

  const saveResponse = () => {
    if (!hasDraftAnswer(currentQuestion, currentDraft)) {
      setMessage('Choose or type an answer before saving this response.')
      return
    }

    setLocalSaved({ ...localSaved, [currentQuestion.id]: true })
    setSeen((currentSeen) => ({ ...currentSeen, [currentQuestion.id]: true }))
    setDraft({
      ...draft,
      [currentQuestion.id]: { ...currentDraft, saved: true },
    })
    setMessage('Response saved.')
    goNext()
  }

  const skipQuestion = () => {
    setSeen((currentSeen) => ({ ...currentSeen, [currentQuestion.id]: true }))
    goNext()
  }

  const submitQuiz = async () => {
    setSubmitting(true)
    setMessage('')

    try {
      const answers = questions
        .filter((question) => draft[question.id]?.saved)
        .map((question) => ({
          questionId: question.id,
          selectedOptionIds: draft[question.id]?.selectedOptionIds || [],
          textAnswer: draft[question.id]?.textAnswer || '',
        }))
      await onSubmit(answers)
      setStarted(false)
      setReviewMode(false)
      setSelectedAttempt(null)
      setShowAttempts(false)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const questionStatus = (question) => {
    if (!reviewMode) {
      if (markedReview[question.id]) return 'marked'
      if (localSaved[question.id]) return 'attempted'
      if (seen[question.id]) return 'seen'
      return 'default'
    }

    const answer = reviewAnswers.get(question.id)
    if (!hasReviewAnswer(question, answer)) return 'unattempted'
    if (question.type === 'subjective') return 'incorrect'
    return answer.is_correct ? 'correct' : 'incorrect'
  }

  const statusClass = (status) => {
    if (status === 'attempted' || status === 'correct') return 'bg-[#5BEA6D] text-black border-[#0f6b1d]'
    if (status === 'seen' || status === 'incorrect') return 'bg-[#F01823] text-black border-[#9f1118]'
    if (status === 'marked') return 'bg-[#7B2CCB] text-black border-[#54208a]'
    if (status === 'unattempted') return 'bg-white/80 text-black border-[#9d7348]'
    return 'bg-white/80 text-black border-[#9d7348]'
  }

  const reviewLabel = () => {
    if (!reviewMode) return currentQuestion.type === 'subjective' ? 'Type your answer' : 'Select the correct option(s)'
    const status = questionStatus(currentQuestion)
    if (status === 'correct') return 'Correct'
    if (status === 'incorrect') return 'Incorrect'
    return 'Unattempted'
  }

  const reviewLabelClass = () => {
    const status = questionStatus(currentQuestion)
    if (status === 'correct') return 'text-green-700'
    if (status === 'incorrect') return 'text-red-700'
    return 'text-[#3b1f00]'
  }

  const summary = questions.reduce((acc, question) => {
    const status = questionStatus(question)
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const resultSummary = questions.reduce((acc, question) => {
    const answer = reviewAnswers.get(question.id)
    if (!hasReviewAnswer(question, answer)) {
      acc.unattempted += 1
    } else if (question.type === 'mcq' && answer.is_correct) {
      acc.correct += 1
    } else {
      acc.incorrect += 1
    }
    return acc
  }, { correct: 0, incorrect: 0, unattempted: 0 })

  if (!started && !reviewMode && !hasAttempt) {
    return (
      <div className="mt-6 bg-[#EEBD89] rounded-3xl border border-[#d9a870] px-7 py-8 shadow-[0_12px_30px_rgba(59,31,0,0.08)]">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-black mb-3">{quiz.title}</h3>
            <p className="text-sm font-semibold text-black">{questions.length} questions</p>
            <p className="text-sm font-semibold text-black">Attempted 0 times</p>
          </div>
          <button
            onClick={startFresh}
            aria-label="Start quiz"
            className="group relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#3b1f00] bg-[#F3D4A5] transition-colors hover:bg-white"
          >
            <span className="ml-1 h-0 w-0 border-y-[12px] border-l-[18px] border-y-transparent border-l-black" />
          </button>
        </div>
      </div>
    )
  }

  if (!started && !reviewMode && hasAttempt) {
    return (
      <div className="mt-6 bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-6 shadow-[0_12px_30px_rgba(59,31,0,0.08)]">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <h3 className="text-3xl font-bold tracking-tight text-black mb-3">{quiz.title}</h3>
            <p className="text-base font-bold text-black">Attempt {ordinal(activeAttempt?.attempt_number || attempts.length)}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <button onClick={() => setShowAttempts(!showAttempts)} className="rounded-lg border border-[#d9a870] bg-[#F3D4A5]/55 px-6 py-2.5 text-sm font-bold text-[#3b1f00] hover:border-[#0f766e] hover:bg-white/45">
              Past attempts
            </button>
            <button onClick={startFresh} className="rounded-lg bg-[#0f766e] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#085044]">
              Re-attempt
            </button>
          </div>
        </div>

        <div className="mt-6 grid overflow-hidden rounded-xl border border-[#d9a870] bg-[#F3D4A5]/45 md:grid-cols-[1fr_1.6fr]">
          <div className="border-b border-[#d9a870] p-5 md:border-b-0 md:border-r">
            <div className="text-lg font-bold text-black">Score</div>
            <div className="mt-3 text-4xl font-extrabold tracking-tight text-black">{latestScore} / {latestMaxScore}</div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-black"><span>Correct</span><span>{resultSummary.correct}/{questions.length}</span></div>
              <div className="mt-2 h-2 bg-black/20"><div className="h-2 bg-[#5BEA6D]" style={{ width: `${(resultSummary.correct / questions.length) * 100}%` }} /></div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-black"><span>Incorrect</span><span>{resultSummary.incorrect}/{questions.length}</span></div>
              <div className="mt-2 h-2 bg-black/20"><div className="h-2 bg-[#F01823]" style={{ width: `${(resultSummary.incorrect / questions.length) * 100}%` }} /></div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-black"><span>Unattempted</span><span>{resultSummary.unattempted}/{questions.length}</span></div>
              <div className="mt-2 h-2 bg-black/20"><div className="h-2 bg-[#7a7a7a]" style={{ width: `${(resultSummary.unattempted / questions.length) * 100}%` }} /></div>
            </div>
          </div>
        </div>

        <button onClick={() => reviewAttempt(activeAttempt)} className="mt-5 rounded-lg bg-[#7B2CCB] px-7 py-3 text-base font-bold text-white shadow-[0_8px_18px_rgba(123,44,203,0.18)] hover:bg-[#6424a5]">
          Solutions
        </button>

        {showAttempts && (
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {attempts
              .slice()
              .sort((a, b) => b.attempt_number - a.attempt_number)
              .map((attempt) => (
                <button
                  key={attempt.id}
                  onClick={() => reviewAttempt(attempt)}
                  className="rounded-lg border border-[#d9a870] bg-white/25 p-4 text-left transition-colors hover:border-[#0f766e] hover:bg-white/45"
                >
                  <div className="text-sm font-bold text-black">Attempt {attempt.attempt_number}</div>
                  <div className="mt-1 text-xs font-bold text-[#0f766e]">Score: {attempt.score}/{attempt.max_score}</div>
                </button>
              ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-6 bg-[#EEBD89] rounded-2xl border border-[#d9a870] p-4 sm:p-6 shadow-[0_12px_30px_rgba(59,31,0,0.08)]">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-black">{quiz.title}</h3>
          <p className="text-sm font-semibold text-black">
            {reviewMode && activeAttempt
              ? `Score: ${activeAttempt.score}/${activeAttempt.max_score} | Attempt ${activeAttempt.attempt_number}`
              : `${questions.length} questions | Attempted ${Object.keys(localSaved).length} times`}
          </p>
        </div>
        <button onClick={reviewMode ? openResults : submitQuiz} disabled={submitting} className="w-fit rounded-lg bg-[#0f766e] px-7 py-2.5 text-sm font-bold text-white hover:bg-[#085044] disabled:opacity-60">
          {reviewMode ? 'Results' : submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        {questions.map((question, index) => (
          <button
            key={question.id}
            onClick={() => goToQuestion(index)}
            className={`h-12 w-12 rounded-md border text-sm font-bold transition-transform hover:-translate-y-0.5 ${statusClass(questionStatus(question))} ${currentIndex === index ? 'ring-4 ring-[#7B2CCB]/25' : ''}`}
            style={{ color: '#000000' }}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-xl border border-[#d9a870] bg-[#F3D4A5]/35 xl:grid-cols-[1fr_300px]">
        <div className="min-h-[280px] border-b border-[#d9a870] p-4 sm:p-5 xl:border-b-0 xl:border-r">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            {!reviewMode && (
              <>
                <button
                  onClick={toggleMarkedReview}
                  className={`flex h-12 w-12 items-center justify-center rounded-md border border-[#9d7348] text-black ${markedReview[currentQuestion.id] ? 'bg-[#7B2CCB] text-white' : 'bg-white/30'}`}
                  aria-label="Mark for review"
                >
                  <span className="h-7 w-5 border-2 border-current border-b-0 before:block before:h-3 before:w-3 before:translate-x-[3px] before:translate-y-[17px] before:rotate-45 before:border-b-2 before:border-r-2 before:border-current before:bg-inherit" />
                </button>
                <button className="flex h-12 w-12 items-center justify-center rounded-md border border-[#9d7348] bg-white/30 text-black" aria-label="Report question">
                  <span className="relative h-0 w-0 border-x-[13px] border-b-[24px] border-x-transparent border-b-black">
                    <span className="absolute left-[-10px] top-[3px] h-0 w-0 border-x-[10px] border-b-[18px] border-x-transparent border-b-[#F3D4A5]" />
                    <span className="absolute -left-[2px] top-[7px] text-xs font-black leading-none text-black">!</span>
                  </span>
                </button>
              </>
            )}
          </div>

          <div className="mb-4 text-base font-bold text-black">Q. {currentIndex + 1}</div>
          {currentQuestion.question_image_url && (
            <img src={currentQuestion.question_image_url} alt="" className="mb-4 h-44 w-full max-w-sm rounded-lg border border-[#d9a870] object-cover" />
          )}
          <p className="whitespace-pre-line text-base font-semibold leading-7 text-black">{currentQuestion.question_text}</p>

          {currentQuestion.type === 'mcq' && currentOptions.length > 0 && (
            <div className="mt-6 grid gap-2">
              {currentOptions.map((option, index) => (
                <div key={optionId(option, index)} className="text-sm font-semibold leading-6 text-black">
                  <span className="font-extrabold">{optionLetter(index)})</span> {optionText(option)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#F3D4A5]/50 p-3">
          <div className={`mb-3 text-sm font-bold ${reviewLabelClass()}`}>{reviewLabel()}</div>

          {currentQuestion.type === 'mcq' ? (
            <div>
              {reviewMode && (
                <div className="mb-3 rounded-md border border-[#d9a870] bg-white/35 p-3 text-xs font-bold leading-5 text-black">
                  <div>Your answer: <span className="text-[#3b1f00]">{answerLabels(selectedReviewIds)}</span></div>
                  <div>Correct answer: <span className="text-[#0f766e]">{answerLabels(correctOptionIds)}</span></div>
                </div>
              )}

              <div className="space-y-2">
              {currentOptions.map((option, index) => {
                const id = optionId(option, index)
                const selected = isOptionSelected(id)
                const correct = reviewMode && correctOptionIds.includes(id)
                const wrongSelection = reviewMode && selected && !correct
                const optionClass = correct
                  ? 'border-[#15803D] bg-[#86EFAC] text-black'
                  : wrongSelection
                    ? 'border-[#B91C1C] bg-[#FCA5A5] text-black'
                    : selected
                      ? 'border-[#1D4ED8] bg-[#93C5FD] text-black'
                      : 'border-[#d9a870] bg-white/35 text-black'

                return (
                  <button
                    key={id}
                    onClick={() => toggleOption(id)}
                    className={`flex min-h-12 w-full items-center gap-3 rounded-md border p-3 text-left transition-colors ${optionClass}`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center border ${selected || correct ? 'border-[#3b1f00] bg-white' : 'border-[#3b1f00] bg-white'}`}>
                      {(selected || correct) && <span className={`h-2.5 w-2.5 ${correct ? 'bg-[#5BEA6D]' : wrongSelection ? 'bg-[#F01823]' : 'bg-[#0f766e]'}`} />}
                    </span>
                    <span className="text-sm font-bold leading-5">{optionLabel(index)}</span>
                  </button>
                )
              })}
              </div>
            </div>
          ) : reviewMode ? (
            <div className="grid gap-3">
              <div className="rounded-md border border-[#d9a870] bg-white/35 p-3">
                <div className="mb-2 text-xs font-bold text-black">Your answer:</div>
                <div className="min-h-20 text-sm font-semibold leading-6 text-black">{reviewAnswer?.text_answer || 'Answered text'}</div>
              </div>
              <div className="rounded-md border border-[#d9a870] bg-white/35 p-3">
                <div className="mb-2 text-xs font-bold text-black">Reference Answer</div>
                <div className="min-h-20 text-sm text-black" />
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-[#d9a870] bg-white/35">
              <textarea
                id="quiz-subjective-answer"
                value={currentDraft.textAnswer}
                onChange={(event) => updateText(event.target.value)}
                placeholder="Type here..."
                className="h-52 w-full resize-none bg-transparent p-3 text-sm font-semibold text-black placeholder-[#7a4a10] focus:outline-none"
              />
              <div className="flex items-center gap-1 border-t border-[#d9a870] bg-[#3b1f00]/5 px-2 py-1.5">
                <button type="button" className="p-1.5 text-xs font-bold text-black hover:bg-[#d9a870]" onClick={() => formatText('bold')}>B</button>
                <button type="button" className="p-1.5 text-xs italic text-black hover:bg-[#d9a870]" onClick={() => formatText('italic')}>I</button>
                <button type="button" className="p-1.5 text-xs underline text-black hover:bg-[#d9a870]" onClick={() => formatText('underline')}>U</button>
                <button type="button" className="p-1.5 text-xs line-through text-black hover:bg-[#d9a870]" onClick={() => formatText('strikethrough')}>S</button>
              </div>
            </div>
          )}

          {reviewMode ? (
            <button onClick={goNext} className="mt-4 w-full rounded-lg bg-[#0f766e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#085044]">
              Next
            </button>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={skipQuestion} className="rounded-lg border border-[#d9a870] bg-white/25 px-4 py-2.5 text-sm font-bold text-[#3b1f00] hover:border-[#0f766e] hover:bg-white/45">
                Skip
              </button>
              <button onClick={saveResponse} className="rounded-lg bg-[#0f766e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#085044]">
                Save & Next
              </button>
            </div>
          )}

          {message && <div className="mt-3 text-xs font-semibold text-[#7a4a10]">{message}</div>}
        </div>
      </div>

      {!reviewMode && (
        <div className="mt-5 grid gap-2 text-xs font-bold text-black sm:grid-cols-4">
          <span>Attempted: {summary.attempted || 0}</span>
          <span>Seen not attempted: {summary.seen || 0}</span>
          <span>Marked for review: {summary.marked || 0}</span>
          <span>Not seen: {summary.default || 0}</span>
        </div>
      )}
    </div>
  )
}

export default QuizPanel
