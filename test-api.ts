import 'reflect-metadata';
import { validate } from 'class-validator';
import { CreateMeasurementDto } from './apps/api/src/measurements/dto/create-measurement.dto';

const dto = new CreateMeasurementDto();
dto.weight = 60.0;
dto.height = 170.0;
dto.activity = 1.2;
dto.date = "2026-04-20T00:00:00Z";

validate(dto).then(errors => {
  console.log("Validation Errors:", errors);
});
