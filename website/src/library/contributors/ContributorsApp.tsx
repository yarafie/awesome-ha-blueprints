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

import React, { useMemo, useRef, useState } from 'react'

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
import FileDrop from './ui/FileDrop'
import CheckPanel from './ui/CheckPanel'
import DetailsForm, { EMPTY_DETAILS, type Details } from './ui/DetailsForm'
import PackagePreview from './ui/PackagePreview'
import { addFiles, EMPTY_FILES, type ContributionFiles } from './services/files'
import { buildZip, type ZipEntry } from './services/zip'

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
  const { state: auth, login, logout } = useAuth('/contributors')

  const [files, setFiles] = useState<ContributionFiles>(EMPTY_FILES)
  const [rejected, setRejected] = useState<string[]>([])
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS)
  // name of the blueprint the entered details belong to
  const detailsFor = useRef<string | null>(null)

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

  // ── status of each card ──────────────────────────────────────────
  const filesStatus: StepStatus = files.yaml && files.png ? 'done' : 'todo'
  const checkStatus: StepStatus =
    !check || check.status === 'free-form'
      ? 'todo'
      : formatPasses && fileProblems.length === 0
        ? 'done'
        : 'fix'
  const detailsLocked = !formatPasses || fileProblems.length > 0
  // An empty release name is explained by the hint under its field. It keeps
  // the package from being built, but it is not shown as an error before the
  // contributor has typed anything.
  const shownProblems = problems.filter(
    (problem) => !problem.startsWith('the release name is missing'),
  )
  const detailsStatus: StepStatus = detailsLocked
    ? 'todo'
    : shownProblems.length > 0
      ? 'fix'
      : problems.length > 0
        ? 'todo'
        : 'done'
  const packageStatus: StepStatus = blocker === null ? 'done' : 'todo'

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
      <h1 className={styles.title}>Contribute a controller</h1>
      <p className={styles.lead}>
        Add your blueprint and a picture. The page checks the format as you go
        and prepares everything else the library needs.
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
          <div className={styles.signin}>
            {user.avatar_url && (
              <img className={styles.avatar} src={user.avatar_url} alt='' />
            )}
            <span className={styles.grow}>
              Signed in as <strong>{user.login}</strong>
            </span>
            <button
              type='button'
              className={styles.linkButton}
              onClick={logout}
            >
              Sign out
            </button>
          </div>

          <StepCard step={1} title='What are you adding?' status='done'>
            <div className={styles.choice}>
              <button
                type='button'
                className={`${styles.choiceItem} ${styles.choiceSelected}`}
                aria-pressed='true'
              >
                New controller
              </button>
              <button type='button' className={styles.choiceItem} disabled>
                New version · coming next
              </button>
            </div>
          </StepCard>

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
            hint={detailsLocked ? 'after the format check' : undefined}
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
          </StepCard>
        </>
      )}
    </main>
  )
}

export default ContributorsApp
