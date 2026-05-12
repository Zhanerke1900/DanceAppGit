import React, { useState } from 'react';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { useI18n } from '../i18n';

interface OrganizerEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
}

interface OrganizerValidator {
  id: string;
  fullName: string;
  email: string;
  assignedEventIds?: string[];
}

interface OrganizerValidatorsProps {
  events?: OrganizerEvent[];
  validators?: OrganizerValidator[];
  onCreateValidator?: (payload: { fullName: string; email: string; password: string }) => Promise<any>;
  onAssignValidator?: (eventId: string, validatorId: string) => Promise<any>;
  onUnassignValidator?: (eventId: string, validatorId: string) => Promise<any>;
}

const formatDate = (dateString: string, locale = 'en-US') => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return 'border-green-500/30 bg-green-500/20 text-green-400';
    case 'draft':
      return 'border-gray-500/30 bg-gray-500/20 text-gray-400';
    case 'archived':
      return 'border-red-500/30 bg-red-500/20 text-red-400';
    case 'pending':
      return 'border-amber-500/30 bg-amber-500/20 text-amber-300';
    default:
      return 'border-purple-500/30 bg-purple-500/20 text-purple-400';
  }
};

export const OrganizerValidators: React.FC<OrganizerValidatorsProps> = ({
  events = [],
  validators = [],
  onCreateValidator,
  onAssignValidator,
  onUnassignValidator,
}) => {
  const { language } = useI18n();
  const copy = {
    en: {
      title: 'Validators',
      subtitle: 'Create validator accounts and assign them to published events.',
      accounts: 'Validator Accounts',
      accountsDesc: 'Create staff accounts for ticket validation at the entrance.',
      fullName: 'Full name',
      email: 'Email',
      password: 'Password',
      created: 'Validator account created. Activation email sent.',
      failed: 'Failed to create validator account.',
      create: 'Create Validator',
      none: 'No validator accounts yet.',
      assignedTo: (count: number) => `Assigned to ${count} event${count === 1 ? '' : 's'}`,
      assignments: 'Validator Assignments',
      assignmentsDesc: 'Assign validators to your published events.',
      publishFirst: 'Publish at least one event first to assign validators.',
      at: 'at',
      noAssigned: 'No validators assigned yet.',
      removeSuffix: 'x',
      select: 'Select validator',
      assign: 'Assign',
      status: { published: 'Published', pending: 'Pending', draft: 'Draft', archived: 'Archived' } as Record<string, string>,
    },
    ru: {
      title: 'Валидаторы',
      subtitle: 'Создавайте аккаунты валидаторов и назначайте их на опубликованные события.',
      accounts: 'Аккаунты валидаторов',
      accountsDesc: 'Создавайте аккаунты сотрудников для проверки билетов на входе.',
      fullName: 'Полное имя',
      email: 'Почта',
      password: 'Пароль',
      created: 'Аккаунт валидатора создан. Письмо активации отправлено.',
      failed: 'Не удалось создать аккаунт валидатора.',
      create: 'Создать валидатора',
      none: 'Аккаунтов валидаторов пока нет.',
      assignedTo: (count: number) => `Назначен(а) на событий: ${count}`,
      assignments: 'Назначения валидаторов',
      assignmentsDesc: 'Назначайте валидаторов на опубликованные события.',
      publishFirst: 'Сначала опубликуйте хотя бы одно событие, чтобы назначить валидаторов.',
      at: 'в',
      noAssigned: 'Валидаторы пока не назначены.',
      removeSuffix: '×',
      select: 'Выберите валидатора',
      assign: 'Назначить',
      status: { published: 'Опубликовано', pending: 'На проверке', draft: 'Черновик', archived: 'Архив' } as Record<string, string>,
    },
    kk: {
      title: 'Валидаторлар',
      subtitle: 'Валидатор аккаунттарын құрып, оларды жарияланған іс-шараларға тағайындаңыз.',
      accounts: 'Валидатор аккаунттары',
      accountsDesc: 'Кіруде билеттерді тексеретін қызметкерлерге аккаунт жасаңыз.',
      fullName: 'Толық аты-жөні',
      email: 'Пошта',
      password: 'Құпиясөз',
      created: 'Валидатор аккаунты құрылды. Белсендіру хаты жіберілді.',
      failed: 'Валидатор аккаунтын құру мүмкін болмады.',
      create: 'Валидатор құру',
      none: 'Әзірге валидатор аккаунттары жоқ.',
      assignedTo: (count: number) => `${count} іс-шараға тағайындалған`,
      assignments: 'Валидатор тағайындаулары',
      assignmentsDesc: 'Валидаторларды жарияланған іс-шараларыңызға тағайындаңыз.',
      publishFirst: 'Валидатор тағайындау үшін алдымен кемінде бір іс-шара жариялаңыз.',
      at: 'сағат',
      noAssigned: 'Әзірге валидатор тағайындалмаған.',
      removeSuffix: '×',
      select: 'Валидаторды таңдаңыз',
      assign: 'Тағайындау',
      status: { published: 'Жарияланды', pending: 'Қаралуда', draft: 'Черновик', archived: 'Архив' } as Record<string, string>,
    },
  }[language];
  const locale = language === 'ru' ? 'ru-RU' : language === 'kk' ? 'kk-KZ' : 'en-US';
  const [validatorForm, setValidatorForm] = useState({ fullName: '', email: '', password: '' });
  const [assignSelections, setAssignSelections] = useState<Record<string, string>>({});
  const [validatorFormError, setValidatorFormError] = useState('');
  const [validatorFormSuccess, setValidatorFormSuccess] = useState('');

  const publishedEvents = events.filter((event) => event.status === 'published');

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Calibri", sans-serif' }}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{copy.title}</h1>
          <p className="text-gray-600">{copy.subtitle}</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-3">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{copy.accounts}</h2>
                <p className="text-sm text-gray-600">{copy.accountsDesc}</p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                autoComplete="off"
                name="validator-full-name"
                value={validatorForm.fullName}
                onChange={(e) => setValidatorForm((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder={copy.fullName}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <input
                autoComplete="off"
                name="validator-email"
                value={validatorForm.email}
                onChange={(e) => setValidatorForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder={copy.email}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <input
                type="password"
                autoComplete="new-password"
                name="validator-password"
                value={validatorForm.password}
                onChange={(e) => setValidatorForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder={copy.password}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              {validatorFormError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {validatorFormError}
                </div>
              )}
              {validatorFormSuccess && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {validatorFormSuccess}
                </div>
              )}
              <button
                onClick={() => {
                  if (!onCreateValidator) return;
                  setValidatorFormError('');
                  setValidatorFormSuccess('');
                  onCreateValidator(validatorForm)
                    .then((result) => {
                      setValidatorForm({ fullName: '', email: '', password: '' });
                      setValidatorFormSuccess(result?.message || copy.created);
                    })
                    .catch((error) => {
                      setValidatorFormError(error?.message || copy.failed);
                    });
                }}
                className="w-full rounded-lg bg-purple-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-purple-600"
              >
                {copy.create}
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {validators.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-600">
                  {copy.none}
                </div>
              ) : validators.map((validator) => (
                <div key={validator.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="font-semibold text-gray-900">{validator.fullName}</p>
                  <p className="mt-1 text-sm text-gray-600">{validator.email}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {copy.assignedTo(validator.assignedEventIds?.length || 0)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{copy.assignments}</h2>
                <p className="text-sm text-gray-600">{copy.assignmentsDesc}</p>
              </div>
            </div>

            {publishedEvents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-600">
                {copy.publishFirst}
              </div>
            ) : (
              <div className="space-y-4">
                {publishedEvents.map((event) => {
                  const assignedValidators = validators.filter((validator) => (validator.assignedEventIds || []).includes(event.id));
                  return (
                    <div key={event.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{event.title}</p>
                          <p className="mt-1 text-sm text-gray-600">{formatDate(event.date, locale)} {copy.at} {event.time}</p>
                        </div>
                        <span className={`rounded-lg border px-3 py-1 text-xs font-medium whitespace-nowrap ${
                          event.status === 'published' ? 'border-green-200 bg-green-50 text-green-700' :
                          event.status === 'draft' ? 'border-gray-200 bg-gray-50 text-gray-700' :
                          event.status === 'archived' ? 'border-red-200 bg-red-50 text-red-700' :
                          event.status === 'pending' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                          'border-purple-200 bg-purple-50 text-purple-700'
                        }`}>
                          {copy.status[event.status] || event.status}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {assignedValidators.length === 0 ? (
                          <span className="text-sm text-gray-500">{copy.noAssigned}</span>
                        ) : assignedValidators.map((validator) => (
                          <button
                            key={validator.id}
                            onClick={() => onUnassignValidator?.(event.id, validator.id).catch(() => {})}
                            className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-red-100 hover:text-red-700"
                          >
                            {validator.fullName} {copy.removeSuffix}
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-col gap-3 md:flex-row">
                        <select
                          value={assignSelections[event.id] || ''}
                          onChange={(e) => setAssignSelections((prev) => ({ ...prev, [event.id]: e.target.value }))}
                          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="">{copy.select}</option>
                          {validators.map((validator) => (
                            <option key={validator.id} value={validator.id}>
                              {validator.fullName}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const validatorId = assignSelections[event.id];
                            if (!validatorId || !onAssignValidator) return;
                            onAssignValidator(event.id, validatorId)
                              .then(() => setAssignSelections((prev) => ({ ...prev, [event.id]: '' })))
                              .catch(() => {});
                          }}
                          className="rounded-lg bg-purple-500 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-600"
                        >
                          {copy.assign}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
