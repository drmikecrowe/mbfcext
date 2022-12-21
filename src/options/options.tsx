import { logger } from "../utils/logger"
import { getTabGroups } from "./components/tab-groups"

const log = logger("options")

export default function Config() {

  const Checkbox = ({ heading, name, description, checked, setValue, styleClasses, labelClasses, fieldClasses, help }) => {
    const toggle = (e) => {
      setValue(!checked)
      checked = !checked
      log(`Updating ${e.target.id} to ${checked}`)
    }
    return (
      <div className={styleClasses}>
        <div className="md:flex md:items-center mb-6">
          <label className={labelClasses} htmlFor={name}>
            <input checked={checked} className={fieldClasses} id={name} name={name} type="checkbox" onChange={toggle} />
            &nbsp;&nbsp;
            <span className="">
              {heading}
              &nbsp;
              {help}
            </span>
          </label>
        </div>
        <div className="md:flex md:items-center mb-6">{description}</div>
      </div>
    )
  }

  const FormControls = () => {
    const tabgroups = getTabGroups()
    return (
      <div>
        {tabgroups.map((g, i) => {
          const legend = (
            <div key={i}>
              <legend>
                <h2>{g.legend}</h2>
              </legend>
              <hr />
            </div>
          )
          const fields = g.fields.map((f: any) => (
            <Checkbox
              checked={f.value}
              setValue={f.setValue}
              description={f.hint}
              fieldClasses={f.fieldClasses}
              heading={f.label}
              help={f.help}
              labelClasses={f.labelClasses}
              name={f.inputName}
              styleClasses={f.styleClasses}
              key={f.inputName}
            />
          ))
          return [legend, ...fields]
        })}
      </div>
    )
  }

  return (
    <div className="content">
      <form className="" id="options-storage">
        <FormControls />
      </form>
    </div>
  )
}
