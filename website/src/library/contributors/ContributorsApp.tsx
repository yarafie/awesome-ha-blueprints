/**
 * ContributorsApp
 * ────────────────────────────────────────────────────────────────
 * One page, one column. A contributor signs in, drops the files of a
 * new controller and gets a verified package to submit.
 *
 * State is small: what was chosen, which files were added and a few
 * details. Everything else on the page (the format check, the guessed
 * manufacturer and model, the package and its files) is calculated
 * from that state on every change, so the page always shows the
 * result of what is currently entered.
 *
 * The rules and the package builder are NOT here. They live in
 * @library/format and are the same code the command line uses.
 *
 * How the package gets submitted is decided later; for now it is
 * offered as a .zip.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useAuth } from '@library/auth/hooks/useAuth'
import { blueprintsContext } from '@site/src/utils/libraryContexts'
import { checkControllerYaml } from '@library/format/controllerFormat.mjs'
import {
  buildControllerPackage,
  guessManufacturerAndModel,
  suggestBlueprintId,
} from '@library/format/controllerPackage.mjs'

import styles from './contributors.module.css'
import StepCard, { type StepStatus } from './ui/StepCard'
import StartChoice, { type Category, type Intent } from './ui/StartChoice'
import FileDrop from './ui/FileDrop'
import CheckPanel from './ui/CheckPanel'
import DetailsForm, { EMPTY_DETAILS, type Details } from './ui/DetailsForm'
import PackagePreview from './ui/PackagePreview'
import UpdateFlow from './UpdateFlow'
import { addFiles, EMPTY_FILES, type ContributionFiles } from './services/files'
import { buildZip, type ZipEntry } from './services/zip'
import {
  saveNewDraft,
  takeDraft,
  takeNewDraft,
  type UpdateDraft,
} from './services/draft'
import { NEW_STEPS, submitNew, type CommitFile } from './services/github'
import SubmitPanel from './ui/SubmitPanel'

/** ids of the controllers that are already in the library */
function existingControllerIds(): string[] {
  const ids = new Set<string>()
  for (const key of blueprintsContext.keys()) {
    const match = /^\.\/controllers\/([^/]+)\//.exec(key)
    if (match) ids.add(match[1])
  }
  return [...ids]
}

function packageReadme(folder: string): string {
  return [
    'Awesome HA Library - contribution package',
    '',
    `This package holds the complete folder for a new controller: ${folder}`,
    'It was checked against the Controller YAML format before it was created.',
    '',
    'To submit it, either',
    '  - attach this .zip to a "New Controller Support" issue at',
    '    https://github.com/yarafie/awesome-ha-blueprints/issues/new/choose',
    '  - or copy the folder into website/docs/blueprints/controllers/ of your',
    '    fork and open a pull request, as described in CONTRIBUTING.md.',
    '',
  ].join('\n')
}

const ContributorsApp: React.FC = () => {
  const {
    state: auth,
    login,
    logout,
    providerToken,
    requestAccess,
    forgetAccess,
  } = useAuth('/contributors')

  const [category, setCategory] = useState<Category | null>(null)
  const [intent, setIntent] = useState<Intent | null>(null)
  const [files, setFiles] = useState<ContributionFiles>(EMPTY_FILES)
  const [rejected, setRejected] = useState<string[]>([])
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS)
  // name of the blueprint the entered details belong to
  const detailsFor = useRef<string | null>(null)
  // an update that was put aside for a visit to GitHub (see SubmitPanel)
  const [updateDraft, setUpdateDraft] = useState<UpdateDraft | null>(null)

  useEffect(() => {
    const draft = takeDraft()
    if (draft) {
      setUpdateDraft(draft)
      setCategory('controllers')
      setIntent('update')
      return
    }
    // a new controller that was put aside, with its picture and manual
    let current = true
    takeNewDraft<Details>().then((saved) => {
      if (!saved || !current) return
      setFiles(saved.files)
      setDetails(saved.details)
      detailsFor.current = saved.detailsFor
      setCategory('controllers')
      setIntent('new')
    })
    return () => {
      current = false
    }
  }, [])
  // once the pull request exists, the answers can no longer be changed
  const [submitted, setSubmitted] = useState(false)

  const existingIds = useMemo(existingControllerIds, [])
  const user = auth.status === 'authenticated' ? auth.user : null
  const yamlText = files.yaml?.text ?? null

  // ── everything below is calculated from the state above ──────────
  const check = useMemo(
    () => (yamlText === null ? null : checkControllerYaml(yamlText)),
    [yamlText],
  )
  const guess = useMemo(
    () => guessManufacturerAndModel(check?.info.model_name),
    [check],
  )
  const manufacturer = details.manufacturer ?? guess.manufacturer
  const model = details.model ?? guess.model
  const blueprintId =
    manufacturer && model ? suggestBlueprintId(manufacturer, model) : ''

  const formatPasses =
    check !== null && check.status === 'checked' && check.errors.length === 0

  const pkg = useMemo(() => {
    if (yamlText === null || !formatPasses || !user) return null
    return buildControllerPackage({
      yamlText,
      existingIds,
      fields: {
        author: { id: user.login, name: user.name ?? user.login },
        manufacturer,
        model,
        release: details.release,
        tags: details.tags,
        notes: details.notes,
        hasPdf: files.pdf !== null,
      },
    })
  }, [
    yamlText,
    formatPasses,
    user,
    existingIds,
    manufacturer,
    model,
    details.release,
    details.tags,
    details.notes,
    files.pdf,
  ])

  // problems found while building: in the file itself, or in the details
  const fileProblems = pkg && pkg.about === 'file' ? pkg.problems : []
  const problems = pkg && pkg.about === 'details' ? pkg.problems : []
  const errorCount = (check ? check.errors.length : 0) + fileProblems.length

  const blocker = !files.yaml
    ? 'Add your YAML first'
    : check?.status === 'legacy'
      ? 'The blueprint must follow the new format'
      : check?.status === 'free-form'
        ? 'Standalone blueprints cannot be packaged here yet'
        : errorCount > 0
          ? `Fix ${errorCount} ${errorCount === 1 ? 'item' : 'items'} in the format check first`
          : problems.length > 0
            ? problems.length === 1 &&
              problems[0].startsWith('the release name is missing')
              ? 'Enter a release name'
              : 'Complete the details first'
            : !files.png
              ? 'Add a picture of the device'
              : !pkg?.ok
                ? 'The package is not ready yet'
                : null

  // the steps appear once the contributor has said what they are adding
  const started = category === 'controllers' && intent === 'new'
  const updating = category === 'controllers' && intent === 'update'

  // ── status of each card ──────────────────────────────────────────
  const filesStatus: StepStatus = files.yaml && files.png ? 'done' : 'todo'
  const checkStatus: StepStatus =
    !check || check.status === 'free-form'
      ? 'todo'
      : formatPasses && fileProblems.length === 0
        ? 'done'
        : 'fix'
  const detailsLocked = !formatPasses || fileProblems.length > 0 || submitted
  // An empty release name is explained by the hint under its field. It keeps
  // the package from being built, but it is not shown as an error before the
  // contributor has typed anything.
  const shownProblems = problems.filter(
    (problem) => !problem.startsWith('the release name is missing'),
  )
  const detailsStatus: StepStatus = submitted
    ? 'done'
    : detailsLocked
      ? 'todo'
      : shownProblems.length > 0
        ? 'fix'
        : problems.length > 0
          ? 'todo'
          : 'done'
  const packageStatus: StepStatus = blocker === null ? 'done' : 'todo'

  // the files of the package as they are sent to GitHub; null until ready
  const newFiles: CommitFile[] | null =
    blocker === null && pkg?.ok && files.png
      ? pkg.files.map((file) =>
          file.kind === 'png'
            ? { path: file.path, bytes: files.png!.bytes }
            : file.kind === 'pdf' && files.pdf
              ? { path: file.path, bytes: files.pdf.bytes }
              : { path: file.path, text: file.text ?? '' },
        )
      : null

  // ── actions ──────────────────────────────────────────────────────
  const handleAdd = async (incoming: File[]) => {
    if (incoming.length === 0) return
    const result = await addFiles(files, incoming)
    // A YAML for a different blueprint starts with empty details. A corrected
    // copy of the same blueprint (same name) keeps what was entered, except
    // the manufacturer and model, which are read from the file again.
    const added = result.files.yaml
    if (added && added !== files.yaml) {
      const name = checkControllerYaml(added.text).info.name ?? ''
      const same = detailsFor.current === null || detailsFor.current === name
      detailsFor.current = name
      setDetails((d) =>
        same ? { ...d, manufacturer: null, model: null } : EMPTY_DETAILS,
      )
    }
    setFiles(result.files)
    setRejected(result.rejected)
  }

  const handleRemove = (kind: keyof ContributionFiles) => {
    setFiles((f) => ({ ...f, [kind]: null }))
    setRejected([])
  }

  const handleDownload = () => {
    if (!pkg?.ok || !pkg.location || !files.png) return
    const encoder = new TextEncoder()
    const entries: ZipEntry[] = [
      {
        path: 'README.txt',
        data: encoder.encode(packageReadme(`controllers/${pkg.location.id}`)),
      },
    ]
    for (const file of pkg.files) {
      if (file.kind === 'png')
        entries.push({ path: file.path, data: files.png.bytes })
      else if (file.kind === 'pdf' && files.pdf)
        entries.push({ path: file.path, data: files.pdf.bytes })
      else if (file.kind === 'text')
        entries.push({ path: file.path, data: encoder.encode(file.text ?? '') })
    }
    const blob = new Blob([buildZip(entries) as BlobPart], {
      type: 'application/zip',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${pkg.location.id}-package.zip`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  // ── page ─────────────────────────────────────────────────────────
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Contribute to the library</h1>
      {user && (
        <div className={styles.signin}>
          {user.avatar_url && (
            <img className={styles.avatar} src={user.avatar_url} alt='' />
          )}
          <span className={styles.grow}>
            Signed in as <strong>{user.login}</strong>
          </span>
          <button type='button' className={styles.linkButton} onClick={logout}>
            Sign out
          </button>
        </div>
      )}

      <p className={styles.lead}>
        Choose what you would like to contribute. The page checks your blueprint
        as you go and prepares everything else the library needs.
      </p>

      {!user && (
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Sign in to start</h2>
          </div>
          <p className={styles.hint} style={{ marginBottom: '0.9rem' }}>
            Your GitHub name is recorded as the author of the blueprint. Nothing
            is submitted from this page.
          </p>
          <div className={styles.actions}>
            <button
              type='button'
              className='button button--primary'
              disabled={auth.status === 'authenticating'}
              onClick={login}
            >
              {auth.status === 'authenticating'
                ? 'Signing in…'
                : 'Sign in with GitHub'}
            </button>
            {auth.status === 'error' && (
              <span className={styles.hint}>{auth.error}</span>
            )}
          </div>
        </section>
      )}

      {user && (
        <>
          <StepCard
            step={1}
            title='What would you like to contribute?'
            status={started || updating ? 'done' : 'todo'}
          >
            <StartChoice
              category={category}
              intent={intent}
              onCategory={setCategory}
              onIntent={(next) => {
                // "Change" also lets go of what was restored after GitHub
                if (next === null) setUpdateDraft(null)
                setIntent(next)
              }}
            />
          </StepCard>

          {updating && (
            <UpdateFlow
              author={user.login}
              token={providerToken}
              requestAccess={requestAccess}
              forgetAccess={forgetAccess}
              draft={updateDraft}
            />
          )}

          {started && (
            <>
              <StepCard step={2} title='Your files' status={filesStatus}>
                <FileDrop
                  files={files}
                  rejected={rejected}
                  onAdd={handleAdd}
                  onRemove={handleRemove}
                />
              </StepCard>

              <StepCard
                step={3}
                title='Format check'
                status={checkStatus}
                hint={
                  check && check.status === 'checked'
                    ? errorCount > 0
                      ? `${errorCount} to fix`
                      : check.warnings.length > 0
                        ? `passed, ${check.warnings.length} ${check.warnings.length === 1 ? 'remark' : 'remarks'}`
                        : 'passed'
                    : undefined
                }
              >
                <CheckPanel check={check} fileProblems={fileProblems} />
              </StepCard>

              <StepCard
                step={4}
                title='A few details'
                status={detailsStatus}
                locked={detailsLocked}
                hint={
                  detailsLocked && !submitted
                    ? 'after the format check'
                    : undefined
                }
              >
                <DetailsForm
                  details={details}
                  library={user?.login ?? ''}
                  guess={guess}
                  blueprintId={blueprintId}
                  problems={shownProblems}
                  disabled={detailsLocked}
                  onChange={setDetails}
                />
              </StepCard>

              <StepCard step={5} title='Your package' status={packageStatus}>
                <PackagePreview
                  files={pkg?.ok ? pkg.files : []}
                  blocker={blocker}
                  onDownload={handleDownload}
                />
                <SubmitPanel
                  submit={
                    newFiles && pkg?.location && user
                      ? (granted, onStep) =>
                          submitNew(
                            {
                              token: granted,
                              login: user.login,
                              id: pkg.location!.id,
                              location: pkg.location!,
                              modelName: check?.info.model_name ?? '',
                              files: newFiles,
                            },
                            onStep,
                          )
                      : null
                  }
                  steps={NEW_STEPS}
                  holds='one commit that adds the folder of your controller'
                  token={providerToken}
                  requestAccess={requestAccess}
                  onLeave={() =>
                    saveNewDraft({
                      files,
                      details,
                      detailsFor: detailsFor.current,
                    })
                  }
                  onSubmitted={() => {
                    setSubmitted(true)
                    // the page has no further use for the permission
                    void forgetAccess()
                  }}
                />
              </StepCard>
            </>
          )}
        </>
      )}
    </main>
  )
}

export default ContributorsApp
