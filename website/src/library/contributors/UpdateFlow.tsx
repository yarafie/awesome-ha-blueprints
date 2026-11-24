/**
 * UpdateFlow
 * ────────────────────────────────────────────────────────────────
 * The steps for "An update to a blueprint": a fix or an improvement
 * for a controller that is already in the library. It becomes a new
 * version of the release it is based on.
 *
 *   2. the blueprint, the version the file is based on, and the file
 *   3. format check and comparison with the stated version
 *   4. a few details for the changelog
 *   5. the package
 *
 * The same steps, with the same checks and the same result, as
 * `pnpm contribute --update`: both use
 * @library/format/controllerUpdate.mjs. The version the update is
 * based on is always stated by the contributor, never assumed.
 */

import React, { useMemo, useState } from 'react'

import {
  buildControllerUpdate,
  type ExistingVersion,
  type UpdateFields,
} from '@library/format/controllerUpdate.mjs'

import styles from './contributors.module.css'
import StepCard, { type StepStatus } from './ui/StepCard'
import FileDrop from './ui/FileDrop'
import CheckPanel from './ui/CheckPanel'
import Message from './ui/Message'
import PackagePreview from './ui/PackagePreview'
import SubmitPanel from './ui/SubmitPanel'
import {
  addFiles,
  EMPTY_FILES,
  type ContributionFiles,
  type YamlFile,
} from './services/files'
import { buildZip, type ZipEntry } from './services/zip'
import { saveDraft, type UpdateDraft } from './services/draft'
import {
  changelogTextOf,
  controllerIds,
  manifestTextOf,
  versionsOf,
} from './services/library'

interface UpdateFlowProps {
  /** GitHub name of the signed-in contributor */
  author: string
  /** GitHub token of the contributor, if the page has one */
  token: string | null
  /** asks GitHub for a permission; the browser leaves the page */
  requestAccess: (scopes: string) => Promise<void>
  /** lets go of the GitHub token once the pull request exists */
  forgetAccess: () => Promise<void>
  /** what was entered before a visit to GitHub, to start from */
  draft: UpdateDraft | null
}

type Kind = UpdateFields['kind']

const nameOf = (v: { library: string; release: string; version: string }) =>
  `${v.library}/${v.release}/${v.version}`

// answers that are known to be fine: with them, everything the builder
// reports is about the file or the version, not about the details
const STAND_IN = {
  kind: 'fix' as Kind,
  description: 'stand-in for the first check',
}

const count = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`

const UpdateFlow: React.FC<UpdateFlowProps> = ({
  author,
  token,
  requestAccess,
  forgetAccess,
  draft,
}) => {
  const [id, setId] = useState(draft?.id ?? '')
  const [baseName, setBaseName] = useState<string | null>(
    draft?.baseName ?? null,
  )
  const [yaml, setYaml] = useState<YamlFile | null>(draft?.yaml ?? null)
  const [rejected, setRejected] = useState<string[]>([])
  // the "Please check" notes the contributor has confirmed
  const [confirmed, setConfirmed] = useState<string | null>(
    draft?.confirmed ?? null,
  )
  const [kind, setKind] = useState<Kind | null>(draft?.kind ?? null)
  const [description, setDescription] = useState(draft?.description ?? '')
  // null: follow the suggestion (an input was removed)
  const [breaking, setBreaking] = useState<boolean | null>(
    draft?.breaking ?? null,
  )
  // once the pull request exists, the answers can no longer be changed
  const [submitted, setSubmitted] = useState(false)

  const ids = useMemo(controllerIds, [])
  const versions: ExistingVersion[] = useMemo(
    () => (id ? versionsOf(id) : []),
    [id],
  )
  const base = versions.find((v) => nameOf(v) === baseName) ?? null

  // ── everything below is calculated from the state above ──────────
  const build = useMemo(() => {
    if (!base || !yaml) return null
    const changelogText = changelogTextOf(id, base.library, base.release)
    const manifestText = manifestTextOf(id)
    return (fields: Omit<UpdateFields, 'author'>) =>
      buildControllerUpdate({
        yamlText: yaml.text,
        id,
        base,
        versions,
        changelogText,
        manifestText,
        fields: { author: { id: author }, ...fields },
      })
  }, [id, base, yaml, versions, author])

  // first with stand-in answers: this tells everything about the file
  const first = useMemo(() => (build ? build(STAND_IN) : null), [build])
  const fileProblems = first && first.about !== null ? first.problems : []
  const fileFine = first !== null && fileProblems.length === 0
  const notes = first?.notes ?? []
  const notesKey = notes.join('\n')
  const intended = notes.length === 0 || confirmed === notesKey
  const isBreaking = breaking ?? first?.suggestBreaking ?? false

  const result = useMemo(
    () =>
      build && fileFine
        ? build({ kind: kind as Kind, description, breaking: isBreaking })
        : null,
    [build, fileFine, kind, description, isBreaking],
  )
  const detailProblems =
    result && result.about === 'details' ? result.problems : []
  // what is simply not answered yet is not shown as an error
  const shownProblems = detailProblems.filter(
    (problem) =>
      !problem.startsWith('say whether this is') &&
      !(description.trim() === '' && problem.startsWith('the description')),
  )

  const blocker = !id
    ? 'Choose the blueprint first'
    : !base
      ? 'Choose the version your file is based on'
      : !yaml
        ? 'Add your updated YAML'
        : !fileFine
          ? `Fix ${count(fileProblems.length, 'item', 'items')} in the check first`
          : !intended
            ? 'Confirm the points under "Please check"'
            : kind === null
              ? 'Say whether this is a fix or an improvement'
              : detailProblems.length > 0
                ? 'Describe what changed'
                : !result?.ok
                  ? 'The package is not ready yet'
                  : null

  const ready = blocker === null && result !== null && result.ok

  // everything the submit step sends; null while the package is not ready
  const submission =
    ready && base && kind && result.location && result.baseCopy
      ? {
          login: author,
          id,
          location: result.location,
          base,
          basePath: `controllers/${id}/${nameOf(base)}/${id}.yaml`,
          baseText: base.text,
          baseCopy: result.baseCopy,
          files: result.files,
          changelogPath: `controllers/${id}/${base.library}/${base.release}/changelog.json`,
          changelogText: changelogTextOf(id, base.library, base.release),
          kind,
          description,
        }
      : null

  // ── status of each card ──────────────────────────────────────────
  const sourceStatus: StepStatus = base && yaml ? 'done' : 'todo'
  const checkStatus: StepStatus = !first
    ? 'todo'
    : !fileFine
      ? 'fix'
      : intended
        ? 'done'
        : 'todo'
  const detailsLocked = !fileFine || !intended || submitted
  const detailsStatus: StepStatus = submitted
    ? 'done'
    : detailsLocked
      ? 'todo'
      : shownProblems.length > 0
        ? 'fix'
        : result?.ok
          ? 'done'
          : 'todo'
  const warnings = first?.check?.warnings.length ?? 0

  // ── actions ──────────────────────────────────────────────────────
  const handleId = (next: string) => {
    setId(next)
    // a version of another blueprint is not a base for this one
    setBaseName(null)
  }

  const handleAdd = async (incoming: File[]) => {
    if (incoming.length === 0) return
    const isYaml = (file: File) => /\.ya?ml$/i.test(file.name)
    const added = await addFiles(EMPTY_FILES, incoming.filter(isYaml))
    if (added.files.yaml) setYaml(added.files.yaml)
    setRejected([
      ...added.rejected,
      ...incoming
        .filter((file) => !isYaml(file))
        .map(
          (file) =>
            `${file.name} was not added. An update only needs the YAML file.`,
        ),
    ])
  }

  const handleRemove = (which: keyof ContributionFiles) => {
    if (which === 'yaml') setYaml(null)
    setRejected([])
  }

  const handleDownload = () => {
    if (!result?.ok || !result.location || !base) return
    const { location } = result
    const encoder = new TextEncoder()
    const readme = [
      'Awesome HA Library - update package',
      '',
      `Blueprint:    controllers/${location.id}`,
      `New version:  ${nameOf(location)}`,
      `Based on:     ${nameOf(base)}`,
      `Kind:         ${kind === 'fix' ? 'fix' : 'improvement'}${isBreaking ? ', existing automations have to be changed' : ''}`,
      `Author:       ${author}`,
      '',
      'The package holds the new version of the blueprint and the changelog',
      'of its release with the new entry. It was checked against the',
      'Controller YAML format and compared with the version it is based on.',
      '',
      'To submit it, either',
      '  - attach this .zip to an issue at',
      '    https://github.com/yarafie/awesome-ha-blueprints/issues/new/choose',
      '  - or use the command line, which prepares the pull request for you:',
      '    see "I Want to Improve an Existing Blueprint" in CONTRIBUTING.md.',
      '',
    ].join('\n')
    const entries: ZipEntry[] = [
      { path: 'README.txt', data: encoder.encode(readme) },
      ...result.files.map((file) => ({
        path: file.path,
        data: encoder.encode(file.text),
      })),
    ]
    const blob = new Blob([buildZip(entries) as BlobPart], {
      type: 'application/zip',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${location.id}-${location.version}-update.zip`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  // ── the cards ────────────────────────────────────────────────────
  const comparison = first?.comparison ?? null
  const inputs = comparison?.inputs ?? null
  const inputChanges = inputs
    ? (['added', 'removed', 'changed'] as const)
        .filter((what) => inputs[what].length > 0)
        .map((what) => `${what}: ${inputs[what].join(', ')}`)
    : []

  return (
    <>
      <StepCard
        step={2}
        title='The blueprint and your file'
        status={sourceStatus}
      >
        <label className={styles.field} style={{ marginBottom: '0.9rem' }}>
          Blueprint
          <select
            className={styles.input}
            value={id}
            onChange={(e) => handleId(e.target.value)}
          >
            <option value=''>Choose a controller…</option>
            {ids.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        {id && versions.length === 0 && (
          <p className={`${styles.finding} ${styles.findingNote}`}>
            This blueprint has no versions to base an update on.
          </p>
        )}

        {versions.length > 0 && (
          <>
            <p className={styles.hint} style={{ marginBottom: '0.4rem' }}>
              Which version is your file based on? It is not assumed to be the
              newest one.
            </p>
            <div className={styles.versions}>
              {versions.map((v) => {
                const name = nameOf(v)
                const newest = !versions.some(
                  (o) =>
                    o.library === v.library &&
                    o.release === v.release &&
                    o.version > v.version,
                )
                return (
                  <button
                    key={name}
                    type='button'
                    aria-pressed={baseName === name}
                    className={`${styles.option} ${styles.version} ${
                      baseName === name ? styles.tileSelected : ''
                    }`}
                    onClick={() => setBaseName(name)}
                  >
                    <span className={styles.tileName}>
                      {v.library}/{v.release} · {v.version}
                    </span>
                    {newest && (
                      <span className={styles.tileHint}>
                        newest of this release
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}

        <FileDrop
          files={{ ...EMPTY_FILES, yaml }}
          rejected={rejected}
          yamlOnly
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
      </StepCard>

      <StepCard
        step={3}
        title='Format check and comparison'
        status={checkStatus}
        hint={
          !first
            ? undefined
            : !fileFine
              ? `${fileProblems.length} to fix`
              : warnings > 0
                ? `passed, ${count(warnings, 'remark', 'remarks')}`
                : 'passed'
        }
      >
        {!first && (
          <p className={styles.hint}>
            Choose the version your file is based on and add your YAML. The
            check and the comparison run right away.
          </p>
        )}

        {first && first.check?.status === 'checked' && (
          // the problems already hold the errors of the format check
          <CheckPanel
            check={{ ...first.check, errors: [] }}
            fileProblems={fileProblems}
          />
        )}

        {first &&
          first.check?.status !== 'checked' &&
          fileProblems.map((problem) => (
            <p
              key={problem}
              className={`${styles.finding} ${styles.findingError}`}
            >
              <Message text={problem} />
            </p>
          ))}

        {first && fileFine && comparison && base && (
          <div className={styles.section}>
            <p className={styles.hint}>Compared with {nameOf(base)}</p>
            <p className={styles.facts}>
              {count(comparison.lines.added, 'line', 'lines')} added,{' '}
              {comparison.lines.removed} removed
              {inputs && inputChanges.length === 0 && ' · inputs unchanged'}
              {inputChanges.map((text) => (
                <React.Fragment key={text}>
                  <br />
                  Inputs {text}
                </React.Fragment>
              ))}
            </p>
          </div>
        )}

        {first && fileFine && notes.length > 0 && (
          <div className={styles.section}>
            <p className={styles.hint}>Please check</p>
            {notes.map((note) => (
              <p
                key={note}
                className={`${styles.finding} ${styles.findingWarning}`}
              >
                <Message text={note} />
              </p>
            ))}
            <label className={styles.tick}>
              <input
                type='checkbox'
                checked={intended}
                onChange={(e) =>
                  setConfirmed(e.target.checked ? notesKey : null)
                }
              />
              Yes, that is what I intend
            </label>
          </div>
        )}
      </StepCard>

      <StepCard
        step={4}
        title='A few details'
        status={detailsStatus}
        locked={detailsLocked}
        hint={detailsLocked && !submitted ? 'after the check' : undefined}
      >
        <fieldset className={styles.fieldset} disabled={detailsLocked}>
          <p className={styles.hint} style={{ marginBottom: '0.4rem' }}>
            What kind of update is it?
          </p>
          <div className={styles.chips}>
            {(
              [
                ['fix', 'A fix'],
                ['improvement', 'An improvement'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type='button'
                aria-pressed={kind === value}
                className={`${styles.chip} ${styles.chipButton} ${
                  kind === value ? styles.chipOn : ''
                }`}
                onClick={() => setKind(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <label className={`${styles.field} ${styles.section}`}>
            What changed, in one line for the changelog
            <input
              className={styles.input}
              type='text'
              value={description}
              placeholder='Long press on the Down button now works with ZHA.'
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label className={`${styles.tick} ${styles.section}`}>
            <input
              type='checkbox'
              checked={isBreaking}
              onChange={(e) => setBreaking(e.target.checked)}
            />
            Existing automations have to be changed after this update
          </label>
          {first?.suggestBreaking && (
            <p className={styles.hint}>
              An input was removed, so existing automations may need changes.
            </p>
          )}

          {shownProblems.length > 0 && (
            <div className={styles.section}>
              {shownProblems.map((problem) => (
                <p
                  key={problem}
                  className={`${styles.finding} ${styles.findingError}`}
                >
                  <Message text={problem} />
                </p>
              ))}
            </div>
          )}
        </fieldset>
      </StepCard>

      <StepCard
        step={5}
        title='Your package'
        status={blocker === null ? 'done' : 'todo'}
      >
        {ready && result.location && base && (
          <p className={styles.facts}>
            New version <strong>{result.location.version}</strong> of {id}, in{' '}
            {base.library}/{base.release}, based on {base.version}.
          </p>
        )}
        <PackagePreview
          files={ready ? result.files : []}
          blocker={blocker}
          onDownload={handleDownload}
        />
        <SubmitPanel
          submission={submission}
          token={token}
          requestAccess={requestAccess}
          onLeave={() =>
            saveDraft({
              id,
              baseName,
              yaml,
              confirmed,
              kind,
              description,
              breaking,
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
  )
}

export default UpdateFlow
